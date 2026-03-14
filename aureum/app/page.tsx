export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aureum</h1>
            <p className="mt-2 text-sm text-neutral-400">
              AI executive-function agent for focus protection and cognitive load management
            </p>
          </div>

          <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            Focus Mode: On
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Current Mode</p>
            <h2 className="mt-2 text-xl font-semibold">Focus</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Low-priority interruptions are being buffered.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Active Task</p>
            <h2 className="mt-2 text-xl font-semibold">Finish hackathon pitch deck</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Estimated block: 45 minutes remaining
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Buffered Interruptions</p>
            <h2 className="mt-2 text-xl font-semibold">3</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Held until your next transition period
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <p className="text-sm text-neutral-400">Upcoming Meeting</p>
            <h2 className="mt-2 text-xl font-semibold">Team Check-In</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Starts in 25 minutes
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-neutral-400">Next Best Action</p>
            <h3 className="mt-3 text-2xl font-semibold">
              Review the Q3 budget draft and verify the page 4 increase.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
              Aureum buffered this request because you are in Focus Mode and the message was
              low urgency but highly ambiguous. It translated the request into a concrete next step.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90">
                Do Now
              </button>
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                Schedule for Later
              </button>
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
                Draft Reply
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-neutral-400">Agent Decision</p>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-neutral-500">Incoming message</p>
                <p className="mt-1 text-white">
                  “Can you look at the Q3 docs when you have a sec?”
                </p>
              </div>

              <div>
                <p className="text-neutral-500">Urgency</p>
                <p className="mt-1 text-amber-300">Low</p>
              </div>

              <div>
                <p className="text-neutral-500">Ambiguity</p>
                <p className="mt-1 text-red-300">High</p>
              </div>

              <div>
                <p className="text-neutral-500">Decision</p>
                <p className="mt-1 text-emerald-300">Buffer and translate</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Buffered Briefing</p>
              <h3 className="mt-2 text-xl font-semibold">Items waiting for your next break</h3>
            </div>
            <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">
              Generate Briefing
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Budget review request</p>
              <p className="mt-2 text-sm text-neutral-400">
                Manager asked for a review of the Q3 draft.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Slide deck edits</p>
              <p className="mt-2 text-sm text-neutral-400">
                Teammate requested feedback on slide 5.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Meeting prep reminder</p>
              <p className="mt-2 text-sm text-neutral-400">
                Team check-in begins in 25 minutes.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}