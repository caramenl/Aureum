**Inspiration**\
The inspiration for Aureum stems from the "Administrative Deadlock" currently paralyzing the U.S. healthcare system. Every year, millions of critical medical procedures are delayed because human reviewers must manually cross-reference 100-page insurance policies against massive patient medical records. We set out to replace this slow, error-prone "opinion-based" process with a high-fidelity, evidence-based engine that prioritizes transparency and patient outcomes.

**What it does**\
Aureum is an institutional-grade clinical intelligence engine that automates medical necessity audits. By ingesting insurance policy PDFs and patient clinical records, the system generates a verifiable, judicial-quality audit trail. It doesn't just provide a decision; it visualizes a chronological Patient Timeline and maps extracted clinical evidence directly to specific policy clauses, providing instant clarity on coverage approvals or denials.

**How we built it**\
We engineered a full-stack solution designed for high-stakes data processing:

Frontend: Built with Next.js 14 and Tailwind CSS, utilizing a high-density, institutional UI/UX to ensure data scannability for legal and medical professionals.

Backend: A FastAPI architecture orchestrating a custom LangGraph engine.

AI Engine: We utilized grounded LLMs to perform semantic extraction, transforming unstructured PDF data into structured clinical entities and temporal events.

Logic Layer: Developed a "Bridge Logic" system that matches extracted medical evidence against specific insurance requirements to calculate approval probabilities.

**Challenges we ran into**\
One of the primary hurdles was temporal reasoning—accurately extracting a chronological history from non-linear medical notes to prove a patient had met "6 weeks of conservative therapy." Additionally, maintaining high precision in PDF parsing across various document formats required rigorous prompt engineering and data validation layers to ensure "judicial-grade" accuracy.

**Accomplishments that we're proud of**\
We are particularly proud of the Evidence Timeline. Transforming hundreds of pages of messy clinical notes into a clean, indisputable visual narrative is a massive leap forward for medical transparency. We also successfully moved away from "black box" AI, ensuring that every claim made by our system is backed by a direct quote or reference from the source documentation.

**What we learned**\
Building Aureum taught us that in healthcare and law, "Correct" is not enough—you must also be "Verifiable." We learned how to balance complex AI reasoning with a user interface that feels secure and institutional, proving that the presentation of data is just as critical as the data itself when dealing with high-stakes decisions.

**What's next for Aureum**\
The next phase for Aureum involves expanding into Automated Appeals, where the system will automatically draft legal and clinical rebuttals for denied claims based on the identified "Solutions." We also plan to integrate FHIR API support to pull records directly from hospital EHR systems, removing the need for manual PDF uploads and creating a real-time clinical audit ecosystem.
