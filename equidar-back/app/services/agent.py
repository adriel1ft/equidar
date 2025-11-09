from textwrap import dedent
from app.models import Municipality, AgentResponse
from app.llm.base import BaseLLM

class AgentService:
    def __init__(self, provider: BaseLLM):
        self.llm = provider

    def _ctx(self, m: Municipality) -> dict:
        return dict(
            id=m.id, name=m.name, state=m.state,
            population=m.population,
            internet_coverage_pct=m.internet_coverage_pct,
            accessibility_index=m.accessibility_index,
            school_infrastructure_index=m.school_infrastructure_index,
            revenue_per_capita=m.revenue_per_capita or 0,
        )

    async def chat(self, m: Municipality, user_message: str, system_goal: str) -> AgentResponse:
        c = self._ctx(m)
        prompt = dedent(f"""
        Goal: {system_goal}

        Municipality:
        - {c['name']} / {c['state']} (ID {c['id']})
        - Population: {c['population']}
        - Internet: {c['internet_coverage_pct']}%
        - Accessibility index: {c['accessibility_index']}
        - School infra index: {c['school_infrastructure_index']}
        - Revenue per capita: {c['revenue_per_capita']}

        User message:
        {user_message}

        Respond with up to 8 bullet points, concrete and actionable, citing numbers above when relevant.
        """).strip()

        reply = await self.llm.generate(prompt)
        return AgentResponse(
            reply=reply,
            used_context_keys=[
                "population","internet_coverage_pct","accessibility_index",
                "school_infrastructure_index","revenue_per_capita"
            ],
        )
