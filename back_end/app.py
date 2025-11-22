from flask import Flask, request, render_template_string, jsonify
from flask_cors import CORS
import os
import json
import re
from dotenv import load_dotenv
from perplexity import Perplexity
from PIL import Image, ImageChops, ImageStat
from PIL.ExifTags import TAGS
import joblib
import io

# Load environment variables
load_dotenv()
api_key = os.getenv('PERPLEXITY_API_KEY')

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Perplexity Client
client = None
if api_key:
    client = Perplexity(api_key=api_key)
else:
    print("Warning: PERPLEXITY_API_KEY not found in .env")

# Load local NLP model and vectorizer for classical fake-news classification
ml_model = None
ml_vectorizer = None
try:
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    vectorizer_path = os.path.join(os.path.dirname(__file__), 'vectorizer.pkl')
    if os.path.exists(model_path) and os.path.exists(vectorizer_path):
        ml_model = joblib.load(model_path)
        ml_vectorizer = joblib.load(vectorizer_path)
        print("Loaded local NLP model and vectorizer for TruthLense.")
    else:
        print("Warning: model.pkl or vectorizer.pkl not found; local NLP model disabled.")
except Exception as e:
    print(f"Warning: Failed to load local NLP model: {e}")

# HTML Template with Loading Animation
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TruthLense AI Detector</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; background-color: #050505; color: #f9fafb; }
        .container { background: #111827; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.8); border: 1px solid #1f2937; }
        h1 { color: #f9fafb; text-align: center; margin-bottom: 30px; font-weight: 300; letter-spacing: 2px; }
        h1 span { color: #ff6b00; font-weight: 600; }
        textarea { width: 100%; height: 120px; padding: 15px; margin: 10px 0; border: 2px solid #374151; border-radius: 8px; font-size: 16px; background-color: #020617; color: #f9fafb; resize: vertical; box-sizing: border-box; }
        textarea:focus { outline: none; border-color: #ff6b00; box-shadow: 0 0 0 1px #ff6b00; }
        button { background-color: #ff6b00; color: #0b0b0b; padding: 15px 20px; border: none; border-radius: 8px; cursor: pointer; font-size: 18px; width: 100%; transition: background 0.3s, transform 0.15s; font-weight: 600; }
        button:hover { background-color: #ea580c; transform: translateY(-1px); }
        
        .result-box { margin-top: 30px; animation: fadeIn 0.5s; }
        .verdict-badge { display: inline-block; padding: 8px 16px; border-radius: 999px; font-weight: bold; text-transform: uppercase; font-size: 1.2em; margin-bottom: 15px; letter-spacing: 1px; }
        .verdict-TRUE { background-color: #15803d; color: #ecfdf3; box-shadow: 0 0 18px rgba(34, 197, 94, 0.5); }
        .verdict-FALSE { background-color: #b91c1c; color: #fee2e2; box-shadow: 0 0 18px rgba(248, 113, 113, 0.5); }
        .verdict-MIXED { background-color: #f97316; color: #111827; box-shadow: 0 0 18px rgba(248, 171, 80, 0.6); }
        .verdict-UNVERIFIABLE { background-color: #4b5563; color: #e5e7eb; }
        
        .card { background: #020617; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #ff6b00; }
        .card h3 { margin-top: 0; color: #f97316; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px; }
        .card p { line-height: 1.6; color: #d1d5db; margin-bottom: 0; }
        
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
        .meta-item { background: #020617; padding: 10px 15px; border-radius: 6px; border: 1px solid #1f2937; }
        .meta-label { font-size: 0.8em; color: #9ca3af; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .meta-value { font-weight: bold; color: #f9fafb; }
        
        .sources-list { list-style: none; padding: 0; margin: 0; }
        .sources-list li { margin-bottom: 8px; padding-left: 20px; position: relative; color: #e5e7eb; }
        .sources-list li:before { content: "•"; color: #ff6b00; position: absolute; left: 0; }
        
        /* Loading Animation */
        .loader-container { display: none; text-align: center; margin-top: 40px; }
        .loader { display: inline-block; width: 50px; height: 50px; border: 3px solid rgba(249,250,251,.1); border-radius: 50%; border-top-color: #ff6b00; animation: spin 1s ease-in-out infinite; }
        .loading-text { margin-top: 15px; color: #9ca3af; font-size: 0.9em; letter-spacing: 1px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    <script>
        function showLoader() {
            document.getElementById('loader-container').style.display = 'block';
            var resultBox = document.getElementById('result-box');
            if (resultBox) {
                resultBox.style.display = 'none';
            }
        }
    </script>
</head>
<body>
    <div class="container">
        <h1>TruthLense <span>AI</span></h1>
        <p style="text-align: center; color: #888; margin-bottom: 30px;">Universal Fact-Checking Assistant</p>
        
        <form method="post" onsubmit="showLoader()">
            <textarea name="text" placeholder="Enter a claim to verify (e.g., historical events, scientific facts, news)..." required>{{ text }}</textarea>
            <button type="submit">Verify Claim</button>
        </form>

        <div id="loader-container" class="loader-container">
            <div class="loader"></div>
            <p class="loading-text">SEARCHING HISTORICAL ARCHIVES & DATABASES...</p>
        </div>

        {% if result %}
            <div id="result-box" class="result-box">
                <div style="text-align: center; margin-bottom: 30px;">
                    <span class="verdict-badge verdict-{{ result.verdict }}">{{ result.verdict }}</span>
                    <div style="color: #888; margin-top: 10px;">Confidence Score: <span style="color: #fff;">{{ result.confidence }}</span></div>
                </div>

                <div class="meta-grid">
                    <div class="meta-item">
                        <span class="meta-label">First Verified</span>
                        <span class="meta-value">{{ result.first_verified }}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Last Updated</span>
                        <span class="meta-value">{{ result.last_updated }}</span>
                    </div>
                </div>

                <div class="card">
                    <h3>Explanation</h3>
                    <p>{{ result.explanation }}</p>
                </div>

                <div class="card">
                    <h3>Historical Context</h3>
                    <p>{{ result.historical_context }}</p>
                </div>

                <div class="card" style="border-left-color: #4b5563;">
                    <h3>Sources</h3>
                    <ul class="sources-list">
                        {% for source in result.sources %}
                            <li>{{ source }}</li>
                        {% endfor %}
                    </ul>
                </div>
            </div>
        {% endif %}
        
        {% if error %}
            <div class="result-box" style="color: #dc3545; text-align: center; padding: 20px;">
                {{ error }}
            </div>
        {% endif %}
    </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def index():
    result = None
    error = None
    text = ""

    if request.method == 'POST':
        text = request.form['text']
        if client:
            try:
                prompt = (
                    "Act as a universal fact-checking assistant with access to historical records dating back to the 1800s and 1900s. "
                    "For the following statement, provide a verdict (TRUE, FALSE, MIXED, UNVERIFIABLE), confidence score (0-100%), "
                    "and a concise but thorough explanation including relevant historical evidence, scientific findings, and authoritative references. "
                    "Crucially, investigate historical context to see if this claim has roots in the 19th or 20th centuries. "
                    "List sources and indicate the first time the claim was verified or disproven in history, plus the last update.\n\n"
                    f"Statement: '{text}'\n\n"
                    "Respond ONLY in valid JSON format with the following keys: "
                    "'verdict' (enum: TRUE, FALSE, MIXED, UNVERIFIABLE), "
                    "'confidence' (string, e.g. '95%'), "
                    "'explanation' (string), "
                    "'historical_context' (string), "
                    "'first_verified' (string, date or era), "
                    "'last_updated' (string, date or era), "
                    "'sources' (list of strings)."
                )
                
                response = client.chat.completions.create(
                    model="sonar-pro",
                    messages=[
                        {"role": "system", "content": "You are a rigorous fact-checking AI that outputs only valid JSON."},
                        {"role": "user", "content": prompt}
                    ]
                )
                
                content = response.choices[0].message.content
                # Clean up code blocks if present
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0]
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0]
                
                result = json.loads(content.strip())
                
            except json.JSONDecodeError:
                error = "Error: Failed to parse AI response. Please try again."
            except Exception as e:
                error = f"Error calling AI API: {str(e)}"
        else:
            error = "Error: Perplexity API Key not configured."

    return render_template_string(HTML_TEMPLATE, result=result, error=error, text=text)

@app.route('/api/verify', methods=['POST'])
def verify_claim():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400
    
    text = data['text']

    # Run local NLP model if available
    ml_result = None
    try:
        if ml_model is not None and ml_vectorizer is not None:
            X = ml_vectorizer.transform([text])
            if hasattr(ml_model, 'predict_proba'):
                proba = ml_model.predict_proba(X)[0]
                fake_prob = float(proba[0])
                real_prob = float(proba[1]) if len(proba) > 1 else 1.0 - fake_prob
                if real_prob >= fake_prob:
                    ml_label = 'Real'
                    ml_conf = real_prob
                else:
                    ml_label = 'Fake'
                    ml_conf = fake_prob
                ml_result = {
                    'label': ml_label,
                    'confidence': round(ml_conf * 100, 1),
                    'raw_probs': {
                        'real': round(real_prob, 4),
                        'fake': round(fake_prob, 4)
                    }
                }
            else:
                pred = ml_model.predict(X)[0]
                ml_label = 'Real' if int(pred) == 1 else 'Fake'
                ml_result = {
                    'label': ml_label,
                    'confidence': 0
                }
    except Exception as e:
        print(f"Warning: local NLP model prediction failed: {e}")

    if not client:
        # If LLM is not available, fall back to local model only
        if ml_result is None:
            return jsonify({'error': 'Perplexity API Key not configured and no local model available'}), 500
        return jsonify({
            'verdict': 'UNVERIFIABLE',
            'confidence': f"{ml_result['confidence']}%",
            'explanation': 'LLM fact-checking is unavailable. Showing local classifier output only.',
            'historical_context': '',
            'first_verified': '',
            'last_updated': '',
            'sources': [],
            'ml_model': ml_result
        })

    try:
        prompt = (
            "Act as a universal fact-checking assistant with access to historical records dating back to the 1800s and 1900s. "
            "For the following statement, provide a verdict (TRUE, FALSE, MIXED, UNVERIFIABLE), confidence score (0-100%), "
            "and a concise but thorough explanation including relevant historical evidence, scientific findings, and authoritative references. "
            "Crucially, investigate historical context to see if this claim has roots in the 19th or 20th centuries. "
            "List sources and indicate the first time the claim was verified or disproven in history, plus the last update.\n\n"
            f"Statement: '{text}'\n\n"
            "Respond ONLY in valid JSON format with the following keys: "
            "'verdict' (enum: TRUE, FALSE, MIXED, UNVERIFIABLE), "
            "'confidence' (string, e.g. '95%'), "
            "'explanation' (string), "
            "'historical_context' (string), "
            "'first_verified' (string, date or era), "
            "'last_updated' (string, date or era), "
            "'sources' (list of strings)."
        )
        
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=[
                {"role": "system", "content": "You are a rigorous fact-checking AI that outputs only valid JSON."},
                {"role": "user", "content": prompt}
            ]
        )
        
        content = response.choices[0].message.content
        # Clean up code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        result = json.loads(content.strip())

        # Attach local NLP model output if available so frontend can show dual-engine verdicts
        if ml_result is not None:
            result['ml_model'] = ml_result

        # --- Heuristic + combined scoring layer ---
        # Parse LLM confidence (string like "95%") into a float 0-100
        llm_conf = 0.0
        try:
            if isinstance(result.get('confidence'), str):
                llm_conf = float(result['confidence'].replace('%', '').strip())
        except Exception:
            llm_conf = 0.0

        # Basic text heuristics for extra signal
        text_len = len(text or "")
        words = text.split()
        num_words = len(words)
        num_exclam = text.count('!')
        has_all_caps_word = any(len(w) > 4 and w.isupper() for w in words)
        url_matches = re.findall(r"https?://\S+", text)
        num_urls = len(url_matches)
        sensational_phrases = [
            "you won't believe",
            "shocking truth",
            "what they don't want you to know",
            "breaking news"
        ]
        has_sensational_phrase = any(p.lower() in text.lower() for p in sensational_phrases)

        heuristic_risk = 0
        if num_exclam >= 3:
            heuristic_risk += 10
        if has_all_caps_word:
            heuristic_risk += 10
        if num_urls >= 2:
            heuristic_risk += 10
        if has_sensational_phrase:
            heuristic_risk += 15
        if num_words < 8 or num_words > 200:
            heuristic_risk += 5
        heuristic_risk = min(40, heuristic_risk)

        # Combined risk score from LLM + local model (+ heuristics)
        combined_score = llm_conf
        engines_agree = None
        ml_conf = ml_result['confidence'] if ml_result and 'confidence' in ml_result else None
        if ml_result and ml_conf is not None:
            # If engines agree, average them closer to their agreement; if they disagree, penalize confidence
            engines_agree = (ml_result.get('label') == ('Real' if result.get('verdict') == 'TRUE' else 'Fake'))
            if engines_agree:
                combined_score = (llm_conf * 0.6) + (ml_conf * 0.4)
            else:
                combined_score = max(0, (llm_conf * 0.5) + (ml_conf * 0.5) - 15)

        combined_score = max(0, min(100, combined_score + heuristic_risk * 0.5))

        result['meta_analysis'] = {
            'combined_confidence_score': round(combined_score, 1),
            'engines_agree': engines_agree,
            'heuristics': {
                'length_chars': text_len,
                'length_words': num_words,
                'num_exclamation_marks': num_exclam,
                'num_urls': num_urls,
                'has_all_caps_word': has_all_caps_word,
                'has_sensational_phrase': has_sensational_phrase,
                'heuristic_risk_bonus': heuristic_risk
            }
        }

        return jsonify(result)
        
    except json.JSONDecodeError:
        return jsonify({'error': 'Failed to parse AI response'}), 500
    except Exception as e:
        return jsonify({'error': f'Error calling AI API: {str(e)}'}), 500

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        image = Image.open(file)
        exif_data = {}

        # Extract EXIF data
        if hasattr(image, '_getexif'):
            exif = image._getexif()
            if exif:
                for tag_id, value in exif.items():
                    tag = TAGS.get(tag_id, tag_id)
                    # Decode bytes to string if necessary
                    if isinstance(value, bytes):
                        try:
                            value = value.decode()
                        except:
                            value = str(value)
                    exif_data[tag] = str(value)

        # Basic Forensic Analysis Simulation (since we don't have a real forensic model yet)
        # In a real app, we would check for compression artifacts, metadata inconsistencies, etc.
        software = exif_data.get('Software', 'Unknown')
        camera = exif_data.get('Model', 'Unknown')

        # Simple heuristic: if 'Photoshop' or 'GIMP' is in software, flag it
        is_suspicious = 'photoshop' in software.lower() or 'gimp' in software.lower()

        # Lightweight CV-style Error Level Analysis (ELA)
        ela_score = 0.0
        ela_summary = ""
        try:
            rgb_image = image.convert('RGB')
            
            # Use in-memory buffer instead of file to avoid locking issues
            buffer = io.BytesIO()
            rgb_image.save(buffer, 'JPEG', quality=90)
            buffer.seek(0)
            
            recompressed = Image.open(buffer).convert('RGB')
            diff = ImageChops.difference(rgb_image, recompressed)
            stat = ImageStat.Stat(diff)
            mean_diff = sum(stat.mean) / (3 * 255.0)
            ela_score = float(round(mean_diff, 4))
            if ela_score < 0.02:
                ela_summary = "Low compression anomalies; image appears structurally consistent."
            elif ela_score < 0.06:
                ela_summary = "Moderate localized anomalies; possible light editing."
            else:
                ela_summary = "Strong localized anomalies; potential heavy editing or compositing detected."
        except Exception as e:
            print(f"ELA Error: {e}")
            ela_summary = f"ELA analysis unavailable: {e}"

        # Combine metadata suspicion and ELA score into an authenticity score
        base_score = 95
        if is_suspicious:
            base_score -= 40
        base_score -= min(40, int(ela_score * 100))

        # Additional image heuristics
        width, height = image.size
        has_small_resolution = (width * height) < (512 * 512)
        extreme_aspect_ratio = (width / float(height)) > 3 or (height / float(width)) > 3
        has_no_exif = len(exif_data) == 0

        tamper_risk = 0
        if has_small_resolution:
            tamper_risk += 5
        if extreme_aspect_ratio:
            tamper_risk += 5
        if has_no_exif:
            tamper_risk += 10
        if is_suspicious:
            tamper_risk += 15
        if ela_score >= 0.06:
            tamper_risk += 20
        tamper_risk = max(0, min(100, tamper_risk))

        authenticity_score = max(0, min(100, base_score))
        verdict = "Tampering Detected" if authenticity_score < 60 or tamper_risk >= 40 else "Original"

        return jsonify({
            'verdict': verdict,
            'authenticity_score': authenticity_score,
            'exif_metadata': {
                'camera': camera,
                'software': software,
                'datetime': exif_data.get('DateTime', 'Unknown')
            },
            'ela_score': ela_score,
            'ela_summary': ela_summary,
            'tamper_risk': tamper_risk,
            'forensic_flags': {
                'has_no_exif': has_no_exif,
                'is_suspicious_software': is_suspicious,
                'has_small_resolution': has_small_resolution,
                'extreme_aspect_ratio': extreme_aspect_ratio,
                'width': width,
                'height': height
            }
        })

    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting TruthLense AI App...")
    print("Go to http://127.0.0.1:5000 in your browser.")
    app.run(debug=True, port=5000)
