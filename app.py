from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

openai.api_key = 'your-api-key' 

@app.route('/message', methods=['POST'])
def reply_to_message():
    data = request.get_json()
    user_message = data.get('message')

    response = openai.ChatCompletion.create(
        model="text-davinci-003",
        messages=[
            {
                "role": "system",
                "content": "You are an intelligent vegan mentor and advocate. You are empathetic, strident, and are equipped to provide advice on transitioning to a vegan lifestyle. You are passionate about reducing suffering in the world."
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
    )

    chatbot_response = response['choices'][0]['message']['content']
    return jsonify({"reply": chatbot_response})

if __name__ == "__main__":
    app.run(debug=True)
