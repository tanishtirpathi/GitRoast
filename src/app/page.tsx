import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Space_Grotesk } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function Home() {
  return (
    <div className={`${sans.className} min-h-screen bg-[#f6f4ef] px-4 py-4 sm:px-8`}>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between py-2">
        <h1 className="text-base font-medium uppercase tracking-[0.18em] text-slate-700">AI Platform</h1>
        <Link
          href="/login"
          className="rounded-lg border border-slate-300 bg-slate-800 text-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50"
        >
          Login
        </Link>
      </header>

      <main className="mx-auto mt-8 grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_1fr] mt-15 px-10">
        <section>
          <h2 className={`${serif.className} mt-4 text-4xl leading-[0.95] text-slate-900 sm:text-7xl`}>
            Speak.
            <br />
            Practice.
            <br />
            Improve.
          </h2>
          <p className="mt-5 max-w-sm text-sm text-slate-600 sm:text-base">
            A minimal AI interviewer for realistic mock sessions.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Login
            </Link>
          </div>

        </section>

        <section className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:p-7">
          <Image
            src="/images/Home/ai.webp"
            alt="AI interviewer illustration"
            width={500}
            height={500}
            priority
            className="mx-auto h-auto w-full max-w-[500px] rounded-2xl"
          />
        </section>
      </main>
    </div>
  );
}
