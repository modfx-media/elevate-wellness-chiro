import { getAllPages } from "@/lib/site-content";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations as officeLocations, socialLinks } from "@/components/site/footer-data";

// All copy below is sourced verbatim from the homepage record in
// seo-audit/site-inventory.json (pageType: "homepage"). Only the visual
// presentation is redesigned; wording/meaning is preserved as-is.

export const hero = {
  headline: "Elevate Your Wellness, Align Your Life",
  subheadline: "Utah's Top Rated Chiropractic Office",
  ctaLabel: "Schedule Appointment",
  ctaHref: BOOKING_URL,
  // Real hero photography pulled directly from the live site's media library.
  image: "/images/homepage/hero.jpg",
  actionShots: ["/images/homepage/hero1.jpg", "/images/homepage/hero2.jpg"],
};

/**
 * Trust signals shown below the hero. Every value here is sourced from the
 * crawl (aggregateRating in the homepage's structuredData; office count from
 * nap-and-hours.json), except "Patients Helped" which was set to "5K+" per
 * explicit client instruction (overrides the crawl's "thousands" wording).
 */
export const trustBadges = [
  { value: "5.0", label: "Patient Rating (180 Reviews)" },
  { value: `${officeLocations.length}`, label: "Utah Locations" },
  { value: "5K+", label: "Patients Helped" },
];

export const services = [
  {
    title: "Chiropractic Care",
    href: "/chiropractic-care/",
    image: "/images/homepage/chiropractic-care.jpg",
    body: "We are dedicated to providing the highest quality chiropractic care in Davis County. Whether you come to us to help with pain management or general wellness, we want to meet you wherever you are in your health journey. Our philosophy is to get to the root cause of your pain and not just address the symptoms. We get great results because we are focused on giving the most specific chiropractic care. We hope you\u2019ll notice the difference, just as many of our patients do.",
  },
  {
    title: "Back Specialist",
    href: "/back-specialist/",
    image: "/images/homepage/lower-back-pain-scaled.jpg",
    body: "Our team of back specialists is dedicated to helping you find relief from chronic pain, injuries, and spinal misalignment. We use advanced techniques to restore mobility, reduce discomfort, and improve overall well-being. Whether dealing with everyday back pain or recovering from an accident, we create personalized treatment plans to address your needs, ensuring you get the care and support necessary for long-term health.",
  },
  {
    title: "Pediatric Chiropractor",
    href: "/pediatric-chiropractor/",
    image: "/images/homepage/dad-and-baby-scaled.jpg",
    body: "For babies, very gentle chiropractic adjustments can help with numerous struggles that our little ones deal with, including colic, reflux, constipation, ear infections, and much more. From infants to teenagers, we\u2019re committed to helping your child adjust and feel their best. Consultations are complimentary to determine if we can help you or your little one with any ailment they may be experiencing.",
  },
  {
    title: "Pregnancy Chiropractor",
    href: "/pregnancy-chiropractor/",
    image: "/images/homepage/pregnancy.jpg",
    body: "Our team is very passionate about prenatal chiropractic care at Elevate Wellness Chiropractic. This period of your life brings about major changes, which can lead to a decrease in mobility and flexibility as you attempt to adjust. During pregnancy, our care can help you relieve pain that develops as your body changes, reach optimal fetal positioning, and may lead to quicker and easier labor and delivery.",
  },
  {
    title: "Spinal Decompression",
    href: "/spinal-decompression/",
    image: "/images/homepage/spinal.jpg",
    body: "At Elevate Wellness Chiropractic, our Bountiful team has helped thousands of patients find lasting relief from their neck and back pain. We provide a very effective, safe, non-surgical treatment of bulging, herniated, and degenerating discs. With our expert chiropractic treatment, you can trust that the chronic pain that plagues your everyday life can become a thing of the past without the need for over-the-counter pain medications.",
  },
  {
    title: "Sports Therapy",
    href: "/sports-therapy/",
    image: "/images/homepage/sports-therapy.jpg",
    body: "Our team specializes in sports therapy, helping athletes of all levels recover from injuries, enhance performance, and prevent future issues. Using chiropractic adjustments, soft tissue therapy, and rehabilitative exercises, we support your body\u2019s natural healing process while optimizing strength and flexibility. Elevate Wellness Chiropractic provides targeted treatment to keep you at your best if you\u2019re dealing with a sports-related injury or looking to improve your physical conditioning.",
  },
  {
    title: "Auto Accidents",
    href: "/auto-accidents/",
    image: "/images/homepage/auto-accident.webp",
    body: "Auto accidents and whiplash injuries are the cause of some of the worst cases we see in our office. In many cases, if proper treatment is not received after an auto accident, there can be lasting pain, discomfort, and disability. We have helped many patients recover from injuries sustained in an auto accident. With the treatments offered here at Elevate Wellness Chiropractic, we can help you recover quicker and more completely from your auto accident injuries.",
  },
  {
    // No dedicated paragraph (or dedicated photo) appears in the homepage
    // crawl for Massage; the copy is sourced from the Massage Therapy page's
    // own metaDescription and the image reuses the real office photo.
    title: "Massage",
    href: "/massage-therapy/",
    image: "/images/homepage/massage-therapy.jpg",
    body: "Discover the benefits of chiropractic massage therapy for pain relief and recovery.",
  },
];

export const servicesHeading = "Chiropractic Services"; // verbatim h2 "CHIROPRACTIC SERVICES"

export const philosophy = {
  eyebrow: "Chiropractic Services in Bountiful, UT", // verbatim h1 "CHIROPRACTIC SERVICES IN BOUNTIFUL, UT"
  heading: "Elevate Wellness Chiropractic: Services for Pain Relief & Wellness",
  body: "Our approach is simple at Elevate Wellness Chiropractic. We are dedicated to providing the highest quality chiropractic care to you and your family in Bountiful Utah. We believe that health is one of the things we value most and will assist you, through your Chiropractor, in achieving your health goals. We provide you and your family pain relief and wellness care whether you have lost your health or are seeking to maintain the good health you already have.",
  image: "/images/homepage/philosophy-primary.png",
  secondaryImage: "/images/homepage/hero1.jpg",
};

export const doctorsHeading = "Meet Your Chiropractors"; // per request; verbatim source is "MEET YOUR CHIROPRACTOR"

export const doctors = [
  {
    name: "Dr. Casey Simmonds",
    href: "/dr-casey-simmonds/",
    image: "/images/homepage/dr-simmonds.png",
    body: "Meet Dr. Casey Simmonds, the owner and founder of Elevate Wellness Chiropractic in Bountiful. Dr. Simmonds is passionate about being a chiropractor and chiropractic care, health, and wellness. He structures his treatments to meet the individual needs of his patients. If you are looking for the best chiropractor in the Bountiful area, Dr. Casey is here to help you!",
  },
  {
    name: "Dr. Kaden Simmonds",
    href: "/kaden-simmonds-dc/",
    image: "/images/homepage/dr-kaden-simmonds.jpeg",
    body: "Dr. Kaden Simmonds grew up in Bountiful, UT, where his best friend\u2019s father, a Chiropractor, inspired him by allowing him to spend hours in his office, learning about Chiropractic care and witnessing its benefits firsthand. Additionally, Dr. Simmonds was heavily involved in sports throughout his upbringing, and it was Chiropractic care that enabled him to stay in the game and perform at his best. These experiences collectively sparked his interest in pursuing a career as a Chiropractor.",
  },
  {
    // Not featured on the homepage crawl; sourced from her own bio page's
    // metaDescription. No photo of her exists anywhere in the crawl, so her
    // card uses an initials avatar instead of a fabricated photo.
    name: "Dr. Mikayla Twarog",
    href: "/mikayla-twarog-dc/",
    image: "/images/homepage/dr-mikayla-twarog.jpg",
    body: "Dr. Mikayla Twarog DC pursued her Doctor of Chiropractic degree at Palmer College of Chiropractic in Davenport, Iowa.",
  },
];

export const ctaBanner = {
  eyebrow: "Elevate Your Wellness",
  heading: "Schedule Today",
  body: "When you need the support of a trusted chiropractic team in the Bountiful area, schedule an appointment with our compassionate, expert chiropractors.",
  callLabel: "Call",
  telHref: officeLocations[0].telHref,
  callDisplay: officeLocations[0].phone,
  onlineLabel: "Schedule Online",
  onlineHref: BOOKING_URL,
  image: "/images/homepage/hero2.jpg",
};

export type LocationKey = "bountiful" | "clinton";

export interface Provider {
  name: string;
  href: string;
  image: string | null;
  role: string;
  body: string;
}

/**
 * Per-location homepage content. Bountiful and Clinton are separate homepages
 * on the live site (/ and /clinton/) with their own philosophy copy, providers,
 * and contact office. Shared sections (services, FAQ, reviews, blog, the map of
 * both offices) are the same on both. All copy is verbatim from the live site.
 */
export const locationContent: Record<LocationKey, {
  key: LocationKey;
  label: string;
  homeHref: string;
  heroEyebrow: string;
  philosophy: { eyebrow: string; heading: string; body: string; image: string; secondaryImage?: string };
  providersHeading: string;
  providers: Provider[];
  ctaBody: string;
  phone: string;
  telHref: string;
}> = {
  bountiful: {
    key: "bountiful",
    label: "Bountiful",
    homeHref: "/",
    heroEyebrow: "Elevate Wellness Chiropractic · Bountiful",
    philosophy,
    providersHeading: "Meet Your Chiropractors",
    providers: [
      { ...doctors[0], role: "Founder & Lead Chiropractor" },
      { ...doctors[1], role: "Chiropractor" },
    ],
    ctaBody: ctaBanner.body,
    phone: officeLocations[0].phone,
    telHref: officeLocations[0].telHref,
  },
  clinton: {
    key: "clinton",
    label: "Clinton",
    homeHref: "/clinton",
    heroEyebrow: "Elevate Wellness Chiropractic · Clinton",
    philosophy: {
      eyebrow: "Chiropractic Services in Clinton, UT",
      heading: "Expert Chiropractic Care in Clinton, UT for Your Wellness Needs",
      body: "At Elevate Wellness Chiropractic, our team is committed to providing patients across the Clinton, Utah, area and beyond with the most reliable, expert chiropractic care. Your health and well-being is our top priority. Whether you\u2019re trying to address new discomfort or were injured and developed chronic pain, we strive to help you reach your health goals. Our chiropractors are here to help you and your family feel your best, ensuring you can enjoy years of quality time with your loved ones.",
      image: "/images/homepage/your-bountiful-chiropractor.jpg",
    },
    providersHeading: "Meet Your Chiropractor",
    providers: [
      {
        name: "Dr. Mikayla Twarog",
        href: "/mikayla-twarog-dc/",
        image: "/images/homepage/dr-mikayla-twarog.jpg",
        role: "Lead Chiropractor",
        body: "Dr. Mikayla Twarog holds a Bachelor in Exercise Science from Ohio University in Athens, Ohio. She pursued her Doctor of Chiropractic degree at Palmer College of Chiropractic in Davenport, Iowa, then spent a year gaining experience treating patients in Pennsylvania, where she developed a strong foundation in providing chiropractic care. She looks forward to bringing those skills to the community of Clinton, Utah.",
      },
    ],
    ctaBody: "When you\u2019re ready to experience the difference our expert chiropractic team in Clinton can make in your health and well-being, don\u2019t hesitate to contact us to schedule an appointment.",
    phone: officeLocations[1].phone,
    telHref: officeLocations[1].telHref,
  },
};

export function getLocationContent(location: LocationKey) {
  return locationContent[location];
}

export const faqItems = [
  {
    question: "What is Chiropractor Care?",
    answer:
      "Chiropractor care is designed to treat the body\u2019s structure to restore motion, reduce pain, and improve function. We provide traditional chiropractic adjustments and other manipulative and manual therapies to treat patients dealing with pain. Spinal manipulation, combined with additional chiropractic treatments, brings relief to patients suffering from back pain, headaches, neck pain, and other spine-related conditions.",
  },
  {
    question: "What is a Chiropractic Adjustment?",
    answer:
      "A chiropractic adjustment is a specialized treatment designed to correct structural alignment and improve the nervous system\u2019s ability to work functionally. Patients experience decreased pain, improved spinal function, and overall health improvement.",
  },
  {
    question: "Do Chiropractic Adjustments Hurt?",
    answer:
      "Chiropractic adjustments are designed to improve the body. Rarely do patients experience pain during or after treatment. Gentle pressure is used to correct the spine, and most patients report feeling immediate relief during treatment. During treatment, patients may hear a popping noise, which is air being released from the joints. Soreness may be experienced a day or two after treatment as the body heals itself. The soreness usually feels similar to how one feels following a vigorous workout.",
  },
  {
    question: "Are Chiropractic Adjustments Safe?",
    answer:
      "When performed by a licensed chiropractor, spinal adjustments are among the safest, drug-free treatments for neuromusculoskeletal problems. Chiropractic adjustments provide patients with a less risky way to find relief from chronic pain and stiffness. Dr. Simmonds is a licensed chiropractor with several years of experience in spinal manipulation treatments. As a member of the International Chiropractic Pediatric Association (ICPA), Dr. Simmonds has the training, skillset, and knowledge needed to perform chiropractic adjustments for patients of all ages safely.",
  },
  {
    question: "Can I Learn to Adjust Myself?",
    answer:
      "No. Chiropractic adjustments require proper education, training, and experience. Dr. Simmonds is trained to adjust the spine in a specific location and direction. Patients cannot perform such spinal adjustments without professional assistance.",
  },
  {
    question: "What Can I Expect at my First Chiropractor Visit?",
    answer:
      "Our Bountiful chiropractor clinic\u2019s initial visit will focus on getting to know you and discussing your health issues. We then discuss various treatments and provide you with an overview of your personalized treatment plan. Depending upon the length of your initial appointment, we can begin the first treatment by performing a spinal adjustment.",
  },
];

export const faqHeading = "Frequently Asked Questions"; // verbatim h2 "FREQUENTLY ASKED QUESTIONS"
export const faqCategoryLabel = "About Chiropractic Care"; // verbatim h2 "ABOUT CHIROPRACTIC CARE"
export const blogHeading = "Our Blog"; // verbatim h2 "Our Blog"

// Real site photography (from the live media library) used as representative
// imagery for blog preview cards, assigned by position rather than per-post
// (the crawl doesn't map a specific image to each post).
export const blogFallbackImages = [
  "/images/homepage/hurt-leg-scaled.jpg",
  "/images/homepage/blog-getty-itofjmnjtxo.jpg",
  "/images/homepage/blog-getty-mzueeaqfqei.jpg",
  "/images/homepage/blog-shutterstock-2256034543.jpg",
];

export interface BlogPreviewPost {
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  publishDate?: string;
}

/** The most recent posts from the Phase 3 blog content collection, newest first. */
export function getRecentBlogPosts(count: number): BlogPreviewPost[] {
  return getAllPages()
    .filter((page) => page.pageType === "blog post")
    .sort((a, b) => {
      const dateA = new Date(a.publishDate ?? a.lastModified).getTime();
      const dateB = new Date(b.publishDate ?? b.lastModified).getTime();
      return dateB - dateA;
    })
    .slice(0, count)
    .map((page) => ({
      slug: page.slug,
      title: page.title,
      excerpt: page.metaDescription,
      href: `/${page.slug}/`,
      publishDate: page.publishDate,
    }));
}

/**
 * Testimonials section. Headings are verbatim from the homepage crawl
 * ("TESTIMONIALS" / "FROM OUR CLIENTS"); rating + count come from the
 * homepage's aggregateRating structured data (ratingValue 5, reviewCount 180).
 * The live "reviews" page is an embedded Google widget with no written quotes
 * in the crawl, so we surface the real aggregate and link to Google instead of
 * inventing testimonials.
 */
export const reviews = {
  eyebrow: "Testimonials", // verbatim h2 "TESTIMONIALS"
  heading: "From Our Clients", // verbatim h2 "FROM OUR CLIENTS"
  ratingValue: "5.0",
  starCount: 5,
  reviewCount: 180,
  reviewCountLabel: "180 Google reviews",
  body: "Utah's Top Rated Chiropractic Office. Our patients consistently rate us five stars, see for yourself why families across Davis County trust Elevate Wellness Chiropractic with their care.",
  googleLabel: "Read Reviews on Google",
  googleHref: socialLinks.find((link) => link.label === "Google")?.href ?? "/reviews/",
  bookLabel: "Schedule Appointment",
  bookHref: BOOKING_URL,
};

export interface Testimonial {
  name: string;
  date: string;
  rating: number;
  text: string;
}

/** Real Google reviews of Elevate Wellness Chiropractic, verbatim from the review widget. */
export const testimonials: Testimonial[] = [
  {
    name: "Lance Tilley",
    date: "4 August 2026",
    rating: 5,
    text: "The doctors are competent and confident. They are great to work with and are fun to be around. They are great.",
  },
  {
    name: "Hector dehesa",
    date: "10 July 2026",
    rating: 5,
    text: "I started going here after my accident last year. I\u2019ve started to feel better right away. Last week I had to use another service in an emergency and my regular chiropractor was on vacation. I called Elevate and they got me in the next morning.",
  },
  {
    name: "Jeny Petersen",
    date: "9 July 2026",
    rating: 5,
    text: "Everyone is pleasant and eager to help you. The doctors are very personable, kind, and helpful. He explained my condition to me and answered all my questions.",
  },
  {
    name: "Brian puff",
    date: "10 June 2026",
    rating: 5,
    text: "I had a rib popped out with pain, I got adjusted with other treatment. I feel better after this and will make this a stop whenever I pass through the area.",
  },
  {
    name: "Juan Pablo Flores",
    date: "18 May 2026",
    rating: 5,
    text: "Los mejores en todo, atenci\u00f3n, recepci\u00f3n, asesoramiento, y claro que salimos de all\u00ed, como nuevos.",
  },
  {
    name: "Audri Ence",
    date: "26 February 2026",
    rating: 5,
    text: "Honest and helpful, highly recommend.",
  },
  {
    name: "Matt Hauck",
    date: "26 February 2026",
    rating: 5,
    text: "Kaden rocks! Super helpful and I\u2019m getting better each visit.",
  },
  {
    name: "Blair Stratton",
    date: "25 February 2026",
    rating: 5,
    text: "Casey and Kaden are the best. I\u2019ve been dealing with issues from a car wreck a couple years ago and they\u2019ve been able to take away the pain and help me feel like myself again.",
  },
  {
    name: "Crystal Walker",
    date: "17 February 2026",
    rating: 5,
    text: "Best chiropractor experience I\u2019ve ever had! Professional, friendly, and incredibly effective. I felt relief almost immediately and continue to see improvement with every visit.",
  },
  {
    name: "Emily J",
    date: "26 January 2026",
    rating: 5,
    text: "I had an excellent experience at Elevate Wellness following a car accident. After the accident, I struggled with limited neck mobility and daily headaches. The team was thorough and got me back to feeling normal again.",
  },
];

/**
 * Office locations for the map + contact section. Sourced verbatim from
 * nap-and-hours.json (both offices' visible on-page address, phone, and hours).
 * mapQuery is the address used to build a keyless Google Maps embed URL.
 */
export const locations = officeLocations.map((location) => ({
  name: location.name,
  address: location.address,
  phone: location.phone,
  telHref: location.telHref,
  hours: location.hours,
  mapQuery: `Elevate Wellness Chiropractic, ${location.address}`,
  mapSrc: `https://www.google.com/maps?q=${encodeURIComponent(`Elevate Wellness Chiropractic, ${location.address}`)}&output=embed`,
}));

export const locationsHeading = {
  eyebrow: "Visit Us",
  heading: "Two Utah Locations",
  body: "Find the Elevate Wellness Chiropractic office nearest you in Bountiful or Clinton. Walk-ins welcome, or schedule your visit online.",
};
