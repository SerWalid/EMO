from flask import Flask
from flask import Blueprint, render_template, session, flash, request, redirect, url_for, jsonify
import os
from dotenv import load_dotenv
from groq import Groq
import base64

app = Flask(__name__)


# Load environment variables from .env file
load_dotenv()
# Access environment variables
api_key = os.getenv('API_KEY')

client = Groq(api_key=api_key)

# Ensure the uploads directory exists
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

questions = [
    {"emotion": "happy", "images": ["happykid1.jpg", "happykid2.jpg"]},
    {"emotion": "sad", "images": ["sadkid1.jpg", "sadkid2.jpg"]},
    {"emotion": "surprised", "images": ["surprisekid1.jpg", "surprisekid2.jpg"]},
    {"emotion": "angry", "images": ["angrykid1.jpg", "angrykid2.jpg"]},
    {"emotion": "fear", "images": ["fearkid1.jpg", "fearkid2.jpg"]}
]

@app.route('/')
def index():
    return render_template('First.html')

@app.route('/LearnEmotions')
def LearnEmotions():
    return render_template('Vision.html')
@app.route('/Music')
def Music():
    return render_template('Music.html')

@app.route('/Vision')
def Vision():
    return render_template('vision.html')

@app.route('/Credits')
def Credits():
    return render_template('credits.html')
@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')
@app.route('/MemoryGame')
def MemoryGame():
    return render_template('MemoryGame.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html')

@app.route('/GameSelectTest')
def GameSelectTest():
    return render_template('GameSelectTest.html')

@app.route('/chess')
def chess():
    return render_template('chess.html')



@app.route('/get_response', methods=['POST'])
def get_response():
    data = request.json
    prompt = data['prompt']
    response = get_llm_response(prompt)
    return jsonify({'response': response})

def get_llm_response(prompt):
    stream = client.chat.completions.create(
        messages=[
            {"role": "system",
             "content": "You are Temo, a compassionate and supportive mental health assistant."},
            {"role": "user", "content": prompt}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.2,
        max_tokens=1024,
        top_p=1,
        stop=None,
        stream=True,
    )

    response = ""
    for chunk in stream:
        delta_content = chunk.choices[0].delta.content
        if delta_content is not None:
            response += delta_content
    return response




# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

@app.route('/analyze', methods=['POST'])
def analyze_image():
    # Get the image from the request
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']

    # Save the image temporarily
    image_path = os.path.join('uploads', image.filename)
    image.save(image_path)

    # Encode the image
    base64_image = encode_image(image_path)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "What's in this image?"},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                ],
            }
        ],
        model="llama-3.2-11b-vision-preview",
    )

    # Get the response
    response_text = chat_completion.choices[0].message.content

    # Remove the temporarily saved image
    os.remove(image_path)

    # Return the result as JSON
    return jsonify({'response': response_text})




if __name__ == '__main__':
    app.run()
