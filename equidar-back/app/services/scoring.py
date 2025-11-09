from app.models import Municipality, ScoreParams, ScoreOut

class ScoringService:
    def score(self, m: Municipality, p: ScoreParams) -> ScoreOut:
        internet = m.internet_coverage_pct / 100.0 if p.normalize else m.internet_coverage_pct
        access = m.accessibility_index
        school = m.school_infrastructure_index

        base = (p.w_internet * internet) + (p.w_access * access) + (p.w_school * school)

        pop_factor = 1.0 if m.population < 50_000 else 0.5 if m.population < 200_000 else 0.2
        rev = m.revenue_per_capita or 0
        rev_factor = 1.0 if rev < 3000 else 0.5
        equity = p.w_equity_boost * (0.5 * pop_factor + 0.5 * rev_factor)

        total = max(0.0, min(1.0, base + equity))

        return ScoreOut(
            municipality_id=m.id,
            score=round(total, 4),
            breakdown={
                "internet": round(internet, 4),
                "accessibility": round(access, 4),
                "school_infrastructure": round(school, 4),
                "equity_bonus": round(equity, 4),
                "weights_in_use": p.model_dump(),
            },
        )
