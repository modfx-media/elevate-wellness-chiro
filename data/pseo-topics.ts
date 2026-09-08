export type PseoTopic = {
  slug: string;
  name: string;
  type: "condition" | "service";
  summary: string;
};

const topic = (
  slug: string,
  name: string,
  type: PseoTopic["type"],
): PseoTopic => ({ slug, name, type, summary: "" });

export const pseoTopics: PseoTopic[] = [
  topic("chiropractic-care", "Chiropractic Care", "service"),
  topic("back-specialist", "Back Specialist", "service"),
  topic("pediatric-chiropractor", "Pediatric Chiropractor", "service"),
  topic("pregnancy-chiropractor", "Pregnancy Chiropractor", "service"),
  topic("spinal-decompression", "Spinal Decompression", "service"),
  topic("sports-therapy", "Sports Therapy", "service"),
  topic("auto-accidents", "Auto Accidents", "service"),
  topic("massage-therapy", "Massage Therapy", "service"),
  topic("back-pain", "Back Pain", "condition"),
  topic("neck-pain", "Neck Pain", "condition"),
  topic("headaches", "Headaches", "condition"),
  topic("migraines", "Migraines", "condition"),
  topic("sciatica", "Sciatica", "condition"),
  topic("whiplash", "Whiplash", "condition"),
  topic("neuropathy", "Neuropathy", "condition"),
  topic("spinal-disc-injuries", "Spinal Disc Injuries", "condition"),
  topic("sports-injuries", "Sports Injuries", "condition"),
  topic("tension-headache", "Tension Headache", "condition"),
  topic("auto-accident-injuries", "Auto Accident Injuries", "condition"),
  topic("workplace-injury", "Workplace Injury", "condition"),
];
