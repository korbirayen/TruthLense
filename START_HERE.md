# TruthLens Prototype Setup

This project consists of a Flask backend and a React frontend. Follow these steps to run the fully functional prototype.

## Prerequisites
- Python 3.8+
- Node.js 16+
- Perplexity API Key (for the backend)

## 1. Backend Setup

1. Navigate to the `back_end` directory:
   ```bash
   cd back_end
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure you have a `.env` file in the `back_end` directory with your Perplexity API key:
   ```
   PERPLEXITY_API_KEY=your_api_key_here
   ```

4. Run the backend server:
   ```bash
   python app.py
   ```
   The backend will start on `http://localhost:5000`.

## 2. Frontend Setup

1. Open a new terminal and navigate to the `front_end` directory:
   ```bash
   cd front_end
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Run the frontend development server:
   ```bash
   npm run dev
   ```
   The frontend will typically start on `http://localhost:5173` (check the terminal output).

## 3. Usage

1. Open your browser and go to the frontend URL (e.g., `http://localhost:5173`).
2. Log in (demo credentials are pre-filled).
3. Enter a claim in the text box and click "Verify Claim".
4. The frontend will communicate with the backend, which uses the Perplexity API to verify the claim.
5. The results, including verdict, confidence, explanation, historical context, and sources, will be displayed.

## Troubleshooting

- **CORS Errors**: If you see CORS errors in the browser console, ensure `flask-cors` is installed and `app.py` has `CORS(app)` enabled (this has been configured).
- **API Errors**: If the backend returns an error, check the backend terminal logs for details. Ensure your API key is valid.
