from app.llm.base import BaseLLM

class EchoProvider(BaseLLM):
    async def generate(self, prompt: str) -> str:
        return f"[echo] {prompt[:1500]}"
