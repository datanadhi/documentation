# 🌊 The Story Behind Data Nadhi
Every project has a story. This one might not be super dramatic, but it's real. Here goes.

---

## The Beginning
After **3 years as a Full Stack Developer**, I decided to follow my passion for **data architecture** and switched to **Data Engineering**.  

But one question kept bugging me:  

> "Can I design and build a complete project on my own — with minimal help from friends or mentors — using AI only as an assistant for validation and repetitive tasks, not as the main builder?"

I tried out several ideas, but none felt meaningful — either they weren't solving real problems I actually faced or existing solutions already covered them.  

💡 **Then, something clicked**  

I remembered needing to send alerts to Slack from an external compute service. I didn't want to hand over my Slack credentials to some third-party platform just for that.  

So, I built a small server that could send Slack messages through APIs using an **encrypted API key** — without ever storing the user's token.  

✅ It worked! Even though it was small, it solved a real problem.  

That got me thinking:  
- What if I supported **multiple destinations**, not just Slack?  
- What if I could **handle data without hitting APIs directly**?  

💥 That's when it hit me — everything I needed was already in **logs**.  

And that's how **Data Nadhi** was born: a platform that flows data from logs to wherever it needs to go.

---

## The Vision
The goal is clear: make **Data Nadhi** the platform that **simplifies and unifies data pipelines**, taking away the complexity of managing them.  

In the future, it should:  
- Support (almost) **all destinations** — from alerts to data stores.  
- Be available as **SDKs in multiple languages**.  
- Make **data movement seamless and developer-friendly**.

---

## The Journey
### Phase 0: Proof of Concept
The PoC is ready! The **backend works end-to-end locally** in a **fully containerized setup** - which means it's **production-ready**.  

The UI isn't ready yet, but the **foundation is solid** and the **core functionality works**.

---

✨ Want to see what we're building?  
Check out the [features](/features) or dive into the [documentation](/docs).
