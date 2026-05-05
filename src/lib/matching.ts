import type { Candidate, JobRequest } from "@prisma/client";

// Simple but explainable scoring used by the admin matching tool.
// Returns 0–100. Higher = better fit.
export function scoreCandidate(
  candidate: Candidate,
  jr: JobRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const max = {
    category: 40,
    germanLevel: 25,
    experience: 20,
    location: 10,
    salary: 5,
  };

  // Job category match
  if (candidate.desiredJobCategory && candidate.desiredJobCategory === jr.jobCategory) {
    score += max.category;
    reasons.push(`Berufsgruppe identisch (+${max.category})`);
  } else if (candidate.alternativeJobs) {
    try {
      const alts: string[] = JSON.parse(candidate.alternativeJobs);
      if (alts.includes(jr.jobCategory)) {
        score += Math.round(max.category * 0.6);
        reasons.push(`Alternative passt (+${Math.round(max.category * 0.6)})`);
      }
    } catch {
      /* ignore */
    }
  }

  // German level
  const order = ["NONE", "A1", "A2", "B1", "B2", "C1", "C2"];
  const reqIdx = jr.requiredGermanLevel ? order.indexOf(jr.requiredGermanLevel) : 0;
  const candIdx = candidate.germanLevel ? order.indexOf(candidate.germanLevel) : 0;
  if (reqIdx === 0) {
    score += max.germanLevel;
  } else if (candIdx >= reqIdx) {
    score += max.germanLevel;
    reasons.push(`Deutsch ${candidate.germanLevel} ≥ erforderlich (+${max.germanLevel})`);
  } else if (candIdx === reqIdx - 1) {
    score += Math.round(max.germanLevel * 0.5);
    reasons.push(`Deutsch ${candidate.germanLevel} 1 Stufe unter Anforderung (+${Math.round(max.germanLevel * 0.5)})`);
  }

  // Experience
  if (jr.minYearsExperience == null || (candidate.yearsExperience ?? 0) >= jr.minYearsExperience) {
    score += max.experience;
    reasons.push(`Erfahrung passt (+${max.experience})`);
  } else if ((candidate.yearsExperience ?? 0) >= jr.minYearsExperience - 1) {
    score += Math.round(max.experience * 0.5);
  }

  // Location
  if (!jr.location) {
    score += max.location;
  } else if (candidate.willingnessToRelocate) {
    score += max.location;
    reasons.push(`Umzugsbereit (+${max.location})`);
  } else if (candidate.preferredCities) {
    try {
      const cities: string[] = JSON.parse(candidate.preferredCities);
      if (cities.some((c) => c.toLowerCase() === jr.location!.toLowerCase())) {
        score += max.location;
        reasons.push(`${jr.location} steht auf Wunschliste (+${max.location})`);
      }
    } catch {
      /* ignore */
    }
  }

  // Salary
  if (jr.salaryMax == null || candidate.expectedSalaryMin == null) {
    score += max.salary;
  } else if (candidate.expectedSalaryMin <= jr.salaryMax) {
    score += max.salary;
    reasons.push(`Gehalts­erwartung passt (+${max.salary})`);
  }

  return { score: Math.min(100, score), reasons };
}
