export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">

                {/* Animated logo mark */}
                <div className="relative flex items-center justify-center">
                    {/* Outer pulsing ring — uses accent-primary token */}
                    <span className="absolute inline-flex h-16 w-16 animate-ping rounded-full bg-accent-primary opacity-20" />

                    {/* Inner icon container */}
                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary">
                        {/* "M" lettermark for Morphiq */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 18V6L9 13L12 8L15 13L20 6V18"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </div>

                {/* Brand wordmark */}
                <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                    morphiq
                </p>

                {/* Thin animated shimmer bar */}
                <div className="relative h-px w-32 overflow-hidden rounded-full bg-border">
                    <span
                        className="absolute inset-y-0 left-0 w-[40%] animate-[slide_1.4s_ease-in-out_infinite]"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                        }}
                    />
                </div>

            </div>

            {/* Slide keyframe — can be moved to globals.css if reused elsewhere */}
            <style>{`
        @keyframes slide {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
        </div>
    );
}
