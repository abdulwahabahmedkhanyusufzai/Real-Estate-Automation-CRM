export interface SimulatedResponse {
  content: string;
  suggestedFollowUps: string[];
}

export const getSimulatedResponse = (prompt: string): SimulatedResponse => {
  const cleanPrompt = prompt.toLowerCase().trim();

  if (cleanPrompt.includes('quantum') || cleanPrompt.includes('physics')) {
    return {
      content: `### Understanding Quantum Computing 🌌

Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers.

Here are the key concepts:

1. **Superposition**: Unlike classical bits (0 or 1), a quantum bit (**qubit**) can exist in a state representing 0, 1, or both simultaneously. Think of a spinning coin—it's not heads or tails until it stops.
2. **Entanglement**: Qubits can become linked, such that the state of one instantly influences another, no matter how far apart they are. Einstein called this *"spooky action at a distance."*
3. **Quantum Interference**: Qubits utilize interference patterns (like waves in water) to amplify correct solutions and cancel out incorrect ones during calculations.

\`\`\`python
# Conceptual example of a qubit state
class Qubit:
    def __init__(self):
        self.state_alpha = 0.707  # Amplitude for state |0>
        self.state_beta = 0.707   # Amplitude for state |1>
        # Note: |alpha|^2 + |beta|^2 = 1 (probabilities sum to 100%)
        
    def measure(self):
        import random
        # Measurement collapses the superposition
        return 0 if random.random() < (self.state_alpha ** 2) else 1
\`\`\`

#### Why does it matter?
Quantum computers could revolutionize cryptography, discover life-saving drugs by simulating molecules, and optimize global logistics routes in seconds.`,
      suggestedFollowUps: [
        'How does quantum cryptography work?',
        'When will quantum computers be available?',
        'What is a qubit made of?'
      ]
    };
  }

  if (cleanPrompt.includes('python') || cleanPrompt.includes('scrape') || cleanPrompt.includes('scraping')) {
    return {
      content: `### Python Web Scraper using BeautifulSoup 🐍

Here is a clean, robust Python script to scrape website headers and links using \`requests\` and \`BeautifulSoup4\`.

\`\`\`python
import requests
from bs4 import BeautifulSoup
import json

def scrape_website(url):
    # Set headers to look like a real browser request
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        print(f"Fetching data from {url}...")
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status() # Raise error for bad responses (4xx, 5xx)
        
        # Parse HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = {
            'title': soup.title.string if soup.title else 'No Title',
            'headers': [h.text.strip() for h in soup.find_all(['h1', 'h2'])],
            'links': []
        }
        
        # Extract all hyperlinks
        for link in soup.find_all('a', href=True):
            href = link['href']
            if href.startswith('http'):
                results['links'].append({
                    'text': link.text.strip() or 'Link',
                    'url': href
                })
                
        return results
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Failed to retrieve webpage: {str(e)}"}

# Example Usage
if __name__ == "__main__":
    target_url = "https://news.ycombinator.com"
    data = scrape_website(target_url)
    
    # Save results to JSON file
    with open('scraped_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
        
    print(f"Scraped {len(data.get('headers', []))} headers and {len(data.get('links', []))} links successfully!")
\`\`\`

#### Prerequisites:
Run the following command to install the required libraries:
\`\`\`bash
pip install requests beautifulsoup4
\`\`\`

*Make sure to review the target website's \`robots.txt\` file and terms of service before running web scraping tasks.*`,
      suggestedFollowUps: [
        'How do I handle pagination in web scrapers?',
        'What is Playwright/Selenium and when should I use it?',
        'How to avoid getting blocked while scraping?'
      ]
    };
  }

  if (cleanPrompt.includes('tokyo') || cleanPrompt.includes('travel') || cleanPrompt.includes('itinerary')) {
    return {
      content: `### 3-Day Tokyo Itinerary: Neon Lights & Ancient Shrines 🇯🇵

Tokyo is a beautiful blend of ultra-modern tech, neon skyscrapers, and deep-rooted traditions. Here is an optimized 3-day itinerary:

#### Day 1: Modern Icons & Shopping
* **Morning (Shibuya)**: Stand at the world-famous **Shibuya Crossing**, take a photo with the Hachiko statue, and enjoy a coffee overlooking the intersection.
* **Afternoon (Harajuku & Meiji Shrine)**: Walk down **Takeshita Street** for quirky fashion and crepes, then slip into the serene forest of the **Meiji Jingu Shrine** next door.
* **Evening (Shinjuku)**: Head to the top of the **Tokyo Metropolitan Government Building** for a free panoramic view of the skyline. Wrap up the night with ramen in Omoide Yokocho's narrow alleys.

#### Day 2: Culture & Historical Vibe
* **Morning (Asakusa)**: Enter through the Kaminarimon Gate to visit **Senso-ji**, Tokyo’s oldest Buddhist temple. Browse the Nakamise shopping street for traditional souvenirs.
* **Afternoon (Akihabara)**: Explore the electronics capital of the world. Visit multi-story anime shops, retro game arcades, and experience a themed cafe.
* **Evening (Roppongi)**: Walk through Mori Art Museum or catch the glowing Tokyo Tower lights from Roppongi Hills.

#### Day 3: Waterfront & Future Tech
* **Morning (Toyosu & Tsukiji)**: Visit Tsukiji Outer Market for fresh sushi breakfast, then head to **teamLab Planets** in Toyosu for a mesmerizing digital art experience.
* **Afternoon (Odaiba)**: Walk along the waterfront, see the giant Unicorn Gundam statue, and cross the Rainbow Bridge.
* **Evening (Ginza)**: Indulge in some high-end shopping and a Michelin-starred dinner to celebrate your final night.

> **Tip**: Buy a Suica/Pasmo card or add it to your Apple Wallet for seamless travel across Tokyo's incredibly efficient train system.`,
      suggestedFollowUps: [
        'What is the best time of year to visit Japan?',
        'How much does a 3-day trip to Tokyo cost?',
        'How to book teamLab Planets tickets?'
      ]
    };
  }

  if (cleanPrompt.includes('react') || cleanPrompt.includes('frontend') || cleanPrompt.includes('framework')) {
    return {
      content: `### React: Declarative Component-Based Frontend Library ⚛️

React is a popular, open-source JavaScript library developed by Meta for building user interfaces, particularly single-page applications.

#### Core Features of React:
1. **Component-Based Architecture**: Build encapsulated components that manage their own state, then compose them to make complex UIs.
2. **Virtual DOM**: Instead of writing slow directly-to-DOM updates, React creates a lightweight in-memory representation. It calculates diffs and updates only what changed.
3. **Declarative UI**: Design simple views for each state in your application, and React will efficiently update and render just the right components when your data changes.

#### A Simple React Functional Component:
\`\`\`tsx
import React, { useState } from 'react';

interface CounterProps {
  initialCount?: number;
  label?: string;
}

export const Counter: React.FC<CounterProps> = ({ initialCount = 0, label = 'Count' }) => {
  const [count, setCount] = useState<number>(initialCount);

  return (
    <div className="p-6 border border-zinc-700 bg-zinc-900 rounded-xl max-w-sm text-center">
      <h3 className="text-lg font-medium text-white mb-2">{label}</h3>
      <p className="text-4xl font-bold text-blue-400 mb-4">{count}</p>
      <div className="flex gap-2 justify-center">
        <button 
          onClick={() => setCount(count - 1)}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition"
        >
          - Decrement
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
        >
          + Increment
        </button>
      </div>
    </div>
  );
};
\`\`\`

React has evolved significantly, supporting Server Components, concurrent rendering, and features like Server Actions in frameworks like Next.js.`,
      suggestedFollowUps: [
        'What are React Hooks and how do they work?',
        'Explain the difference between React and Next.js',
        'How to optimize React application performance?'
      ]
    };
  }

  // Generic templates
  const genericResponses = [
    {
      content: `### Getting Started with your request! 💡

That's an interesting question. Here's a structured overview of **"${prompt}"**:

1. **Core Concept**: The request is centered around exploring key facets of this topic, which requires understanding its context, utility, and implementation.
2. **Key Benefits**:
   * **Efficiency**: Offers a streamlined workflow.
   * **Scalability**: Can grow seamlessly to meet demanding requirements.
   * **Flexibility**: Adapts well to diverse situations and environments.
3. **Common Approaches**:
   * **Self-Discovery**: Analyzing parameters and researching standard documentation.
   * **Automation**: Writing scripts or leveraging libraries to solve the core problem.
   * **Collaboration**: Sharing findings and refining with community input.

Here is a quick concept code snippet for illustration:
\`\`\`typescript
// Concept class showing configuration details
interface Config {
  enabled: boolean;
  mode: 'simple' | 'advanced';
}

class SystemController {
  private config: Config;

  constructor(cfg: Config) {
    this.config = cfg;
  }

  public processInput(query: string): void {
    if (this.config.enabled) {
      console.log(\`Processing "${prompt}" in \${this.config.mode} mode...\`);
    }
  }
}
\`\`\`

What specific aspects of this topic would you like to dive deeper into?`,
      suggestedFollowUps: [
        'Can you provide a concrete coding example?',
        'What are the best practices for this?',
        'Explain this in simpler terms.'
      ]
    },
    {
      content: `### Exploring your query: "${prompt}" 🚀

Here is a breakdown of what you need to consider:

* **Initial Assessment**: Identify your goals and boundary conditions before tackling this problem.
* **Implementation Steps**:
  1. Define the system configuration and data requirements.
  2. Implement a prototype using clean, modular code.
  3. Validate performance, security, and edge cases.
  4. Deploy and monitor system feedback.

> *"Simplicity is the soul of efficiency."* A clean architecture is always easier to debug and scale over time.

Feel free to ask me to write code, design database schemas, or review architectures for this scenario!`,
      suggestedFollowUps: [
        'How would you design the database schema for this?',
        'What security precautions are necessary?',
        'What are the common pitfalls of this approach?'
      ]
    }
  ];

  // Pick one generic response based on prompt length
  const index = prompt.length % genericResponses.length;
  return genericResponses[index];
};
