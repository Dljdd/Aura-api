class LangflowClient {
    constructor(baseURL, apiKey) {
        this.baseURL = baseURL;
        this.apiKey = apiKey;
    }
  
    async post(endpoint, body, headers = {"Content-Type": "application/json"}) {
      if (this.apiKey) {
            headers["Authorization"] = `Bearer ${this.apiKey}`;
        }
        const url = `${this.baseURL}${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
  
            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error(`Error during POST request: ${error.message}`);
            throw error;
        }
    }
  
    async initiateSession(flowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/api/v1/run/${flowId}?stream=${stream}`;
        return this.post(endpoint, { input_value: inputValue, input_type: inputType, output_type: outputType, tweaks: tweaks });
    }
  
    async handleStream(streamUrl, onUpdate, onClose, onError) {
      try {
        const response = await fetch(streamUrl);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            onClose('Stream closed');
            break;
          }
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                onUpdate(data);
              } catch (error) {
                console.error('Error parsing JSON:', error);
              }
            }
          }
        }
      } catch (error) {
        console.error('Stream Error:', error);
        onError(error);
      }
    }
  
    async runFlow(flowIdOrName, inputValue, inputType = 'chat', outputType = 'chat', tweaks, stream = false, onUpdate, onClose, onError) {
        try {
            const initResponse = await this.initiateSession(flowIdOrName, inputValue, inputType, outputType, stream, tweaks);
            if (stream && initResponse?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                const streamUrl = this.baseURL + initResponse.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                this.handleStream(streamUrl, onUpdate, onClose, onError);
            }
            return initResponse;
        } catch (error) {
          onError('Error initiating session');
        }
    }
  }
  
  async function main(inputValue, inputType = 'chat', outputType = 'chat', stream = false) {
    const flowIdOrName = '2814e0aa-a990-4b9b-8c71-fe47e152282c';
    const langflowClient = new LangflowClient('http://127.0.0.1:7860',
          'your-api-key');
    const tweaks = {
  "ChatInput-GbG9w": {
    "files": "",
    "input_value": "what is a better alternative to normal toothbrushes?\n",
    "sender": "User",
    "sender_name": "User",
    "session_id": "",
    "should_store_message": true
  },
  "AstraVectorStoreComponent-n41VL": {
    "api_endpoint": "https://35919421-e0a8-42fd-a0a0-7c1f94b8367b-us-east-2.apps.astra.datastax.com",
    "batch_size": null,
    "bulk_delete_concurrency": null,
    "bulk_insert_batch_concurrency": null,
    "bulk_insert_overwrite_concurrency": null,
    "collection_indexing_policy": "",
    "collection_name": "test2",
    "embedding_service": "Astra Vectorize",
    "metadata_indexing_exclude": "",
    "metadata_indexing_include": "",
    "metric": "cosine",
    "namespace": "",
    "number_of_results": 4,
    "pre_delete_collection": false,
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
    "should_store_message": true
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
    "n": null,
    "stream": false,
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
    "include_answer": true,
    "include_images": true,
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
};
  
    try {
        const response = await langflowClient.runFlow(
            flowIdOrName,
            inputValue,
            inputType,
            outputType,
            tweaks,
            stream,
            (data) => console.log("Received:", data.chunk), // onUpdate
            (message) => console.log("Stream Closed:", message), // onClose
            (error) => console.error("Stream Error:", error) // onError
        );
  
        if (!stream && response) {
            const flowOutputs = response.outputs[0];
            const firstComponentOutputs = flowOutputs.outputs[0];
            const output = firstComponentOutputs.outputs.message;
  
            console.log("Final Output:", output.message.text);
        }
    } catch (error) {
        console.error('Main Error:', error.message);
    }
  }
  
  const args = process.argv.slice(2);
  main(
    args[0], // inputValue
    args[1], // inputType
    args[2], // outputType
    args[3] === 'true' // streaming
  );
  