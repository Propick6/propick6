import { adTiers } from "@/lib/mockData";

export default function AdvertisePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl">ADVERTISE ON PRO PICK 6</h1>
        <div className="text-sm text-muted">
          Get in front of serious sports bettors every day.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {adTiers.map((t) => (
          <div
            key={t.id}
            className={`rounded-xl p-5 border ${
              t.highlight
                ? "border-green bg-green/5"
                : "border-border bg-panel"
            }`}
          >
            {t.highlight && (
              <div className="text-[10px] text-green font-semibold mb-1 tracking-wider">
                BEST VALUE
              </div>
            )}
            <div className="font-display text-2xl">{t.name}</div>
            <div className="text-sm text-muted mt-1">{t.desc}</div>
            <div className="mt-4 flex items-end gap-1">
              <span className="font-display text-4xl">${t.price}</span>
              <span className="text-muted text-sm pb-1.5">/{t.period}</span>
            </div>
            <button
              className={`mt-4 w-full font-semibold py-2.5 rounded-full ${
                t.highlight
                  ? "bg-green text-bg"
                  : "bg-panel2 border border-border text-text hover:border-green"
              }`}
            >
              Get started
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-panel p-4 text-sm space-y-2">
        <div className="font-display text-lg">HOW IT WORKS</div>
        <div className="text-muted">
          1. Pick a placement tier above. 2. Our team reaches out within 24
          hours to set up creative + billing. 3. Your ad goes live on the
          Feed/Leaderboard. 4. You receive a weekly performance report.
        </div>
        <div className="pt-2">
          Questions? Reach us at{" "}
          <a
            href="mailto:ads@propick6.com"
            className="text-green underline"
          >
            ads@propick6.com
          </a>
          .
        </div>
      </div>
    </div>
  );
}
