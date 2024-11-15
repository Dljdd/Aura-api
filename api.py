import argparse
import json
from argparse import RawTextHelpFormatter
import requests
from typing import Optional
import warnings
try:
    from langflow.load import upload_file
except ImportError:
    warnings.warn("Langflow provides a function to help you upload files to the flow. Please install langflow to use it.")
    upload_file = None

BASE_API_URL = "http://127.0.0.1:7860"
FLOW_ID = "2814e0aa-a990-4b9b-8c71-fe47e152282c"
ENDPOINT = "" # You can set a specific endpoint name in the flow settings

# You can tweak the flow by adding a tweaks dictionary
# e.g {"OpenAI-XXXXX": {"model_name": "gpt-4"}}
TWEAKS = {
  "ChatInput-GbG9w": {
    "files": "",
    "input_value": "what is a better alternative to normal toothbrushes?\n",
    "sender": "User",
    "sender_name": "User",
    "session_id": "",
    "should_store_message": True
  },
  "AstraVectorStoreComponent-n41VL": {
    "api_endpoint": "https://35919421-e0a8-42fd-a0a0-7c1f94b8367b-us-east-2.apps.astra.datastax.com",
    "batch_size": None,
    "bulk_delete_concurrency": None,
    "bulk_insert_batch_concurrency": None,
    "bulk_insert_overwrite_concurrency": None,
    "collection_indexing_policy": "",
    "collection_name": "test2",
    "embedding_service": "Astra Vectorize",
    "metadata_indexing_exclude": "",
    "metadata_indexing_include": "",
    "metric": "cosine",
    "namespace": "",
    "number_of_results": 4,
    "pre_delete_collection": False,
    "search_filter": {
      "_id": "$vector"
    },
    "search_input": "",
    "search_score_threshold": 0.7,
    "search_type": "Similarity",
    "setup_mode": "Sync",
    "token": "AstraCS:jnlxdalxGUAEFvScevJtCSxW:f9724fda76706684ed6c5897c339560b334bee09dbb1f728f9104c59a02cc7fa"
  },
  "ParseData-q9rs5": {
    "sep": "---",
    "template": "{text}\n---\n\nGiven the above context here are some relevant links: {links}"
  },
  "ChatOutput-J2FmS": {
    "data_template": "{text}",
    "input_value": "",
    "sender": "Machine",
    "sender_name": "AI",
    "session_id": "",
    "should_store_message": True
  },
  "note-34IK9": {},
  "note-AsNSV": {},
  "note-249FK": {},
  "GroqModel-RAOBx": {
    "groq_api_base": "https://api.groq.com",
    "groq_api_key": "GROQ_API_KEY",
    "input_value": "",
    "max_tokens": 8000,
    "model_name": "llama-3.2-90b-text-preview",
    "n": None,
    "stream": False,
    "system_message": "You are a Eco Friendly Products AI Advisor bot and you can help users, identify, find and buy Eco Friendly Products and calculate their products carbon footprint, step by step. You can let the user give product link and return product eco friendly status, as many times as they want and ask to process with getting required certifications for it. You can let the user know relevant eco friendly certifications when ever user shows a product he is interested in, as many times as they want. You and the user can discuss about sustainability and eco friendly products prices and the user can share their goals, or get advices.  If the user wants to sell products, or complete another impossible task, respond that you are a eco friendly products assistant and cannot do that.  Besides that, you can also chat with users and do some calculations or share suggestions if needed.",
    "temperature": 0.3
  },
  "Prompt-mB2cg": {
    "template": "{context}\n{links}\n---\n\nGiven the context above, and the relevant links answer the question as best as possible and list the sources mentioned in the links.\n\nQuestion: {question}\n\nAnswer: \n\n\nSources: ",
    "context": "",
    "question": "",
    "links": ""
  },
  "TavilyAISearch-TAxzB": {
    "api_key": "TAVILY_KEY",
    "include_answer": True,
    "include_images": True,
    "max_results": 5,
    "query": "",
    "search_depth": "advanced",
    "topic": "general"
  },
  "ParseJSONData-l5wxq": {
    "query": ".[] | select(has(\"results\")) | .results[] | {title: .title, url: .url}"
  },
  "ParseData-WqIJ5": {
    "sep": "\n",
    "template": "{text}"
  }
}

def run_flow(message: str,
  endpoint: str,
  output_type: str = "chat",
  input_type: str = "chat",
  tweaks: Optional[dict] = None,
  api_key: Optional[str] = None) -> dict:
    """
    Run a flow with a given message and optional tweaks.

    :param message: The message to send to the flow
    :param endpoint: The ID or the endpoint name of the flow
    :param tweaks: Optional tweaks to customize the flow
    :return: The JSON response from the flow
    """
    api_url = f"{BASE_API_URL}/api/v1/run/{endpoint}"

    payload = {
        "input_value": message,
        "output_type": output_type,
        "input_type": input_type,
    }
    headers = None
    if tweaks:
        payload["tweaks"] = tweaks
    if api_key:
        headers = {"x-api-key": api_key}
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()

def main():
    parser = argparse.ArgumentParser(description="""Run a flow with a given message and optional tweaks.
Run it like: python <your file>.py "your message here" --endpoint "your_endpoint" --tweaks '{"key": "value"}'""",
        formatter_class=RawTextHelpFormatter)
    parser.add_argument("message", type=str, help="The message to send to the flow")
    parser.add_argument("--endpoint", type=str, default=ENDPOINT or FLOW_ID, help="The ID or the endpoint name of the flow")
    parser.add_argument("--tweaks", type=str, help="JSON string representing the tweaks to customize the flow", default=json.dumps(TWEAKS))
    parser.add_argument("--api_key", type=str, help="API key for authentication", default=None)
    parser.add_argument("--output_type", type=str, default="chat", help="The output type")
    parser.add_argument("--input_type", type=str, default="chat", help="The input type")
    parser.add_argument("--upload_file", type=str, help="Path to the file to upload", default=None)
    parser.add_argument("--components", type=str, help="Components to upload the file to", default=None)

    args = parser.parse_args()
    try:
      tweaks = json.loads(args.tweaks)
    except json.JSONDecodeError:
      raise ValueError("Invalid tweaks JSON string")

    if args.upload_file:
        if not upload_file:
            raise ImportError("Langflow is not installed. Please install it to use the upload_file function.")
        elif not args.components:
            raise ValueError("You need to provide the components to upload the file to.")
        tweaks = upload_file(file_path=args.upload_file, host=BASE_API_URL, flow_id=args.endpoint, components=[args.components], tweaks=tweaks)

    response = run_flow(
        message=args.message,
        endpoint=args.endpoint,
        output_type=args.output_type,
        input_type=args.input_type,
        tweaks=tweaks,
        api_key=args.api_key
    )

    print(json.dumps(response, indent=2))

if __name__ == "__main__":
    main()
