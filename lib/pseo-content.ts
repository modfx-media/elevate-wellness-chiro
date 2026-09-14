import type { PseoContent } from "@/data/pseo-content-batch-01";
import { pseoContentBatch01 } from "@/data/pseo-content-batch-01";
import type { PseoPage } from "@/lib/pseo-pages";

function officeFor(page: PseoPage) {
  return page.city.county === "Davis" || page.city.county === "Salt Lake"
    ? { name: "Bountiful", drive: page.city.driveTimeFromBountiful }
    : { name: "Clinton", drive: page.city.driveTimeFromClinton };
}

/** Hand-written batch content when present; otherwise unique city + topic copy. */
export function getPseoContent(page: PseoPage): PseoContent {
  return pseoContentBatch01[page.slug] ?? buildGeneratedPseoContent(page);
}

function buildGeneratedPseoContent(page: PseoPage): PseoContent {
  const { city, topic } = page;
  const office = officeFor(page);
  const landmark = city.landmarks[0] ?? `${city.name} City Park`;
  const landmarkTwo = city.landmarks[1] ?? city.landmarks[0] ?? city.name;
  const neighborhood = city.neighborhoods[0] ?? city.name;
  const neighborhoodTwo = city.neighborhoods[1] ?? neighborhood;
  const topicLower = topic.name.toLowerCase();
  const kind = topic.type === "condition" ? "concern" : "service";

  return {
    h1: `${topic.name} in ${city.name}, UT`,
    introHeading: `${topic.name} Care for ${city.name} Residents`,
    introParagraphs: [
      `Looking for ${topicLower} near ${city.name}? Elevate Wellness Chiropractic helps ${city.county} County patients with conservative chiropractic evaluation and care. Whether you live near ${neighborhood}, work around ${landmark}, or travel through ${city.name} regularly, our team starts with your history, daily activities, and goals instead of a one-size-fits-all plan.`,
      `Our ${office.name} office is about ${office.drive} from ${city.name}, so follow-up visits can fit around work, school, and time near ${landmarkTwo}. Bring questions, prior imaging if you have it, and examples of movements that feel limited. The first visit focuses on whether chiropractic care is appropriate before anyone discusses a schedule.`,
      `Medical Disclaimer: Information on this site is not medical advice and is for educational purposes only. No doctor-patient relationship is formed. Seek urgent medical attention for severe or rapidly worsening symptoms, new weakness, loss of bowel or bladder control, chest pain, difficulty breathing, or symptoms following a serious injury.`,
      `After listening and examining posture, joint motion, and muscle tension, your chiropractor can explain findings in plain language. If another clinician or imaging is a better next step, we say so. ${topic.name} recommendations for someone in ${neighborhoodTwo} may differ from a neighbor who sits all day or trains near ${landmark}.`,
    ],
    whyHeading: `Why ${city.name} Patients Choose Elevate Wellness`,
    whyParagraphs: [
      `${city.name} residents choose Elevate Wellness for nearby ${office.name} access, clear exams, and care that is adjusted after each visit. The short trip from ${neighborhood} can make it easier to stay consistent without rearranging an entire day.`,
      `There are other chiropractic offices near ${city.name}. Elevate is a fit when you want a thorough conversation about this ${kind}, honest limits, and a plan you can measure against real activities—not a preset package.`,
    ],
    faqs: [
      {
        question: `What happens at a first ${topicLower} visit from ${city.name}?`,
        answer: `A first visit includes your health history, daily activities, and goals, then an exam of movement, posture, and joint function. Treatment is not automatic. You can review findings, options, and whether chiropractic care or a referral is the better next step.`,
      },
      {
        question: `How far is Elevate Wellness from ${city.name}?`,
        answer: `The ${office.name} office is about ${office.drive} from ${city.name} in typical traffic. Times vary with your starting point, weather, and road work. Patients near ${landmark} or ${neighborhood} can call for directions and allow extra travel time.`,
      },
      {
        question: `Can chiropractic care help with ${topicLower} if I live in ${city.name}?`,
        answer: `Chiropractic care may help some people with musculoskeletal ${kind}s related to ${topicLower}, depending on exam findings. It cannot guarantee a specific outcome. New, severe, or worsening symptoms should be medically evaluated, and we coordinate with other clinicians when that is the safer path.`,
      },
    ],
    ctaHeading: `Schedule ${topic.name} Care Near ${city.name}`,
    ctaBody: [
      `Book a visit at our ${office.name} office to discuss ${topicLower} and whether chiropractic care is appropriate for you.`,
      "Choose a time that works, and bring the questions you want answered before care begins.",
    ],
  };
}
