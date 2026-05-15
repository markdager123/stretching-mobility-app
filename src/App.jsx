import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ── Dark mode global styles ───────────────────────────────────────────────
const DARK_STYLE = `
  * { box-sizing: border-box; }
  body { background:#121212; color:#e8e8e8; margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  input, select, textarea {
    background:#2a2a2a !important; color:#e8e8e8 !important;
    border:1px solid #555 !important; border-radius:6px; padding:6px 8px;
    font-family:inherit; font-size:13px; outline:none; width:100%;
    -webkit-appearance:none; appearance:none;
  }
  select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23aaa' d='M6 8L0 0h12z'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 10px center !important;
    background-size: 10px !important;
    padding-right: 28px !important;
  }
  input::placeholder, textarea::placeholder { color:#666 !important; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); }
  option { background:#2a2a2a !important; color:#e8e8e8 !important; }
  details summary { list-style:none; }
  details summary::-webkit-details-marker { display:none; }
  ::-webkit-scrollbar { width:4px; height:4px; }
  ::-webkit-scrollbar-track { background:#1a1a1a; }
  ::-webkit-scrollbar-thumb { background:#444; border-radius:2px; }
`;

const DARK = {
  bg: '#121212',
  bg2: '#1e1e1e',
  bg3: '#2a2a2a',
  bg4: '#333333',
  border: '#3a3a3a',
  border2: '#444444',
  text: '#e8e8e8',
  text2: '#aaaaaa',
  text3: '#888888',
};

// ── Supabase config ───────────────────────────────────────────────────────
const SUPABASE_URL = "https://uhatnqbqzbtnsqscocdz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoYXRucWJxemJ0bnNxc2NvY2R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MDEzNTcsImV4cCI6MjA5MjQ3NzM1N30.Wiir3TzuFLXM9SCgej3QHEG2JVUdjuuf5qvd7DFtMwU";

async function sbFetch(path, options = {}) {
  const res = await fetch(SUPABASE_URL + "/rest/v1/" + path, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Supabase error: " + err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const STORAGE_KEY = "mobility-app-v5";

const EXERCISES = [{"id":"ex-1","name":"Elevated Pigeon Stretch","completions":12,"reps":"","bodyPosition":"Standing","bodyRegion":"Glutes","type":"Stretching","favorite":"No","primaryMuscle":"Glutes","routines":["S6","S8","S14"],"video":"https://www.youtube.com/shorts/UrBAdKjH2nE","workOn":"Work On","muscleTags":["Glutes"]},{"id":"ex-2","name":"90/90 w/ Shin Box and Bridge","completions":6,"reps":"5 reps each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Back","routines":["M6"],"video":"https://www.youtube.com/shorts/9nhhZIpIZ7A","workOn":"No","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-3","name":"Frog Stretch","completions":15,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Adductors","type":"Stretching","favorite":"Favorite","primaryMuscle":"Adductors/Groin","routines":["S2","S8"],"video":"https://www.youtube.com/shorts/orMZYFWo9P0","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-4","name":"Half Kneeling Wall Planted Hip CARs","completions":6,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M10"],"video":"https://www.youtube.com/shorts/RsZQfyVbdqc","workOn":"No","muscleTags":["Hips"]},{"id":"ex-5","name":"Laying One Leg Hamstring Stretch (Band Assisted)","completions":13,"reps":"","bodyPosition":"On Back","bodyRegion":"Hamstrings","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hamstrings","routines":["S5","S7"],"video":"https://www.youtube.com/shorts/Wnhc8hsTtpI","workOn":"Work On","muscleTags":["Hamstrings"]},{"id":"ex-6","name":"Reverse Lunge w/ Twist","completions":6,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Quads","type":"Mobility","favorite":"No","primaryMuscle":"Quads/Back","routines":["M4"],"video":"https://www.youtube.com/shorts/seKtSEMLHmk","workOn":"Work On","muscleTags":["Quads","Upper/Mid Back"]},{"id":"ex-7","name":"Double Pigeon Pose","completions":15,"reps":"","bodyPosition":"Sitting","bodyRegion":"Glutes","type":"Stretching","favorite":"No","primaryMuscle":"Glutes","routines":["S3","S10"],"video":"https://www.youtube.com/watch?v=NBJfGSxyFcs","workOn":"No","muscleTags":["Glutes"]},{"id":"ex-8","name":"Split Squat with Front Leg Calf Raise","completions":7,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"Favorite","primaryMuscle":"Ankles/Calves/Knees/Quads","routines":["M13","M16"],"video":"https://www.youtube.com/shorts/0yYpgDe9QuU","workOn":"No","muscleTags":["Ankles","Calves","Knees","Quads"]},{"id":"ex-9","name":"Saddle Archer","completions":14,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Stretching","favorite":"No","primaryMuscle":"Shoulders","routines":["S1","S7"],"video":"https://www.youtube.com/watch?v=Qy42GOZLoRI","workOn":"Work On","muscleTags":["Shoulders"]},{"id":"ex-10","name":"Wide Stance Lateral Reach","completions":6,"reps":"","bodyPosition":"Standing","bodyRegion":"Core","type":"Stretching","favorite":"No","primaryMuscle":"Obliques/Shoulders","routines":["S9"],"video":"https://www.youtube.com/shorts/nVAV4Y31bVE","workOn":"No","muscleTags":["Core","Shoulders"]},{"id":"ex-11","name":"Crescent Lunge","completions":16,"reps":"2 reps of 15 sec","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Lower Back","routines":["M1","M8"],"video":"https://www.youtube.com/shorts/S5r1LJ-oHHY","workOn":"Work On","muscleTags":["Hips","Lower Back"]},{"id":"ex-12","name":"Half Kneel Archer Stretch","completions":6,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back/Shoulders","routines":["M6"],"video":"https://www.youtube.com/watch?v=7rySuV9YqAo","workOn":"No","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-13","name":"Supported Sissy Squat","completions":12,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees/Quads","routines":["M4","M7"],"video":"https://www.youtube.com/watch?v=EbVQEmgCQLk","workOn":"Work On","muscleTags":["Knees","Quads"]},{"id":"ex-14","name":"Banded Ankle Dorsiflexion","completions":6,"reps":"10 reps each side","bodyPosition":"Sitting","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles","routines":["M6"],"video":"https://www.youtube.com/shorts/v-cxqr5OKEk","workOn":"No","muscleTags":["Ankles"]},{"id":"ex-15","name":"Quadruped Hip CARs","completions":9,"reps":"5 reps each direction","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M1"],"video":"https://www.youtube.com/watch?v=3HcqUibHeDY","workOn":"No","muscleTags":["Hips"]},{"id":"ex-16","name":"Half Kneeling Knee Over Toe Half Circles","completions":6,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees","routines":["M3"],"video":"https://www.youtube.com/shorts/gUltNrPPE28","workOn":"No","muscleTags":["Knees"]},{"id":"ex-17","name":"Hip Hinge w/ Arm Extension","completions":6,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders/Back/Hamstrings","routines":["M6"],"video":"https://www.youtube.com/shorts/0tPTCXRsREM","workOn":"No","muscleTags":["Hamstrings","Shoulders","Upper/Mid Back"]},{"id":"ex-18","name":"Cobra Pose w/ Rotations","completions":9,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Stretching","favorite":"No","primaryMuscle":"Abs/Back","routines":["S3","S14"],"video":"https://www.youtube.com/watch?v=Nd3j6Avtv6Q","workOn":"No","muscleTags":["Core","Upper/Mid Back"]},{"id":"ex-19","name":"Heel Slides on Back","completions":6,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees","routines":["M6"],"video":"https://www.youtube.com/shorts/t17Z6HeiiQs","workOn":"No","muscleTags":["Knees"]},{"id":"ex-20","name":"Downward Dog","completions":13,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings/Calves/Back","routines":["S2","S12"],"video":"https://www.youtube.com/shorts/T9ZA30LL-kY","workOn":"Work On","muscleTags":["Calves","Hamstrings","Upper/Mid Back"]},{"id":"ex-21","name":"Seated Saddle Stretch (Band Assisted)","completions":9,"reps":"","bodyPosition":"Sitting","bodyRegion":"Adductors","type":"Stretching","favorite":"Favorite","primaryMuscle":"Adductors/Groin/Lower Back","routines":["S6","S12"],"video":"https://www.youtube.com/watch?v=NssV0dyYfFw&ab_channel=ElmiraFamilyChiropractic","workOn":"Work On","muscleTags":["Adductors","Lower Back"]},{"id":"ex-22","name":"Spiderman Lunge w/ Rotation","completions":15,"reps":"6 reps","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Mobility","favorite":"Favorite","primaryMuscle":"Quads/Hip Flexors/Back","routines":["M2","M7"],"video":"https://www.youtube.com/watch?v=qCDFp8cPrqw","workOn":"No","muscleTags":["Hips","Quads","Upper/Mid Back"]},{"id":"ex-23","name":"Half Kneeling Shoulder Rotations","completions":6,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders","routines":["M4"],"video":"https://www.youtube.com/watch?v=jEb9INyam40","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-24","name":"Cobra to Downward Dog","completions":13,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Stretching","favorite":"Favorite","primaryMuscle":"Abs/Back/Hamstrings/Calves","routines":["S4","S8"],"video":"https://www.youtube.com/watch?v=Pro1dTNYcZo","workOn":"No","muscleTags":["Calves","Core","Hamstrings","Upper/Mid Back"]},{"id":"ex-25","name":"Cobra Pose","completions":16,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Stretching","favorite":"No","primaryMuscle":"Abs/Back","routines":["S1","S10"],"video":"https://www.youtube.com/watch?v=Nd3j6Avtv6Q","workOn":"No","muscleTags":["Core","Upper/Mid Back"]},{"id":"ex-26","name":"Deep Squat Rotations","completions":13,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back/Hips","routines":["M4","M8"],"video":"https://www.youtube.com/shorts/hKpehetjeA4","workOn":"Work On","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-27","name":"Butterfly Stretch","completions":8,"reps":"","bodyPosition":"Sitting","bodyRegion":"Adductors","type":"Stretching","favorite":"No","primaryMuscle":"Adductors/Groin","routines":["S4"],"video":"https://www.youtube.com/watch?v=4J7kbCmPScQ","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-28","name":"Twisted Lizard Rocks","completions":13,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Mobility","favorite":"Favorite","primaryMuscle":"Quads/Hips","routines":["M6","M8"],"video":"https://www.youtube.com/shorts/cDfFLpuSf00","workOn":"Work On","muscleTags":["Hips","Quads"]},{"id":"ex-29","name":"Leaning Back Saddle Quad Stretch","completions":13,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Stretching","favorite":"Favorite","primaryMuscle":"Quads/Hip Flexors","routines":["S5","S7"],"video":"https://www.youtube.com/watch?v=f_n7T2FjQhI&ab_channel=JordanBoNieuwsma","workOn":"Work On","muscleTags":["Hips","Quads"]},{"id":"ex-30","name":"Lying Banded Single Leg Hip Flexion","completions":6,"reps":"10 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M4"],"video":"https://www.youtube.com/watch?v=fXpMD1le5wM&ab_channel=EmpowerFitness","workOn":"No","muscleTags":["Hips"]},{"id":"ex-31","name":"Band Pullaparts","completions":13,"reps":"15 reps","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Mobility","favorite":"Favorite","primaryMuscle":"Shoulders","routines":["M3","M8"],"video":"https://www.youtube.com/shorts/SuvO4TBwSu4","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-32","name":"Split Stance Adductor Cossack Rocks","completions":6,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Adductors","routines":["M4"],"video":"https://www.youtube.com/watch?v=ZFOaBWk986w","workOn":"No","muscleTags":["Adductors","Hips"]},{"id":"ex-33","name":"Behind-the-Back Elbow-to-Elbow Grip","completions":10,"reps":"","bodyPosition":"Sitting","bodyRegion":"Chest","type":"Stretching","favorite":"No","primaryMuscle":"Chest/Shoulders","routines":["S1","S13"],"video":"https://www.youtube.com/watch?v=5v5228pJ_v4","workOn":"No","muscleTags":["Chest","Shoulders"]},{"id":"ex-34","name":"Standing Forward Fold","completions":10,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hamstrings","routines":["S1","S13"],"video":"https://www.youtube.com/shorts/Yi77TzNoafQ","workOn":"No","muscleTags":["Hamstrings"]},{"id":"ex-35","name":"Behind-the-Back Interlaced Hands","completions":7,"reps":"","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Stretching","favorite":"No","primaryMuscle":"Shoulders/Chest/Biceps","routines":["S9","S14"],"video":"https://www.youtube.com/shorts/2kx8BdPtONY","workOn":"Work On","muscleTags":["Arms","Chest","Shoulders"]},{"id":"ex-36","name":"Downward Dog Squats","completions":6,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Calves/Hamstrings","routines":["M6"],"video":"https://www.youtube.com/watch?v=NqzLySpHsRI","workOn":"No","muscleTags":["Calves","Hamstrings"]},{"id":"ex-37","name":"Neck Side Stretch","completions":16,"reps":"","bodyPosition":"Standing","bodyRegion":"Neck","type":"Stretching","favorite":"No","primaryMuscle":"Neck","routines":["S2","S9"],"video":"https://www.youtube.com/watch?v=54y0JAT46vE","workOn":"No","muscleTags":["Neck"]},{"id":"ex-38","name":"Lateral Lunges","completions":13,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors/Knees/Quads","routines":["M3","M8"],"video":"https://www.youtube.com/shorts/TnOkq6KfHsM","workOn":"No","muscleTags":["Adductors","Knees","Quads"]},{"id":"ex-39","name":"Cossack Squats","completions":9,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"Favorite","primaryMuscle":"Adductors/Hips/Quads","routines":["M1"],"video":"https://www.youtube.com/watch?v=3UrcjsqfTQ8","workOn":"Work On","muscleTags":["Adductors","Hips","Quads"]},{"id":"ex-40","name":"Lower Back Isolation Cat-Cow","completions":9,"reps":"8 reps","bodyPosition":"Kneeling","bodyRegion":"Lower Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Lower Back","routines":["M2"],"video":"https://www.youtube.com/shorts/yHpfdhD6AFo","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-41","name":"Half Kneeling Lateral Adductor Rocks","completions":6,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors/Hips","routines":["M6"],"video":"https://www.youtube.com/shorts/S71DenPCNeY","workOn":"No","muscleTags":["Adductors","Hips"]},{"id":"ex-42","name":"Happy Baby","completions":8,"reps":"","bodyPosition":"On Back","bodyRegion":"Adductors","type":"Stretching","favorite":"No","primaryMuscle":"Adductors/Groin","routines":["S5"],"video":"https://www.youtube.com/watch?v=Ppku7i3ypGM","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-43","name":"Standing Quad Stretch","completions":9,"reps":"","bodyPosition":"Standing","bodyRegion":"Quads","type":"Stretching","favorite":"No","primaryMuscle":"Quads","routines":["S1"],"video":"https://www.youtube.com/watch?v=FBO9-8nTbsM","workOn":"No","muscleTags":["Quads"]},{"id":"ex-44","name":"Sumo Squat","completions":9,"reps":"","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Stretching","favorite":"No","primaryMuscle":"Adductors/Groin","routines":["S1"],"video":"https://www.youtube.com/shorts/7G9rnrJZaN4","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-45","name":"Supermans - Hands Behind Head","completions":13,"reps":"5 reps 10 sec hold","bodyPosition":"On Stomach","bodyRegion":"Lower Back","type":"Mobility","favorite":"No","primaryMuscle":"Lower Back","routines":["M4","M8"],"video":"https://www.youtube.com/watch?v=NVElTwPz_mU","workOn":"Work On","muscleTags":["Lower Back"]},{"id":"ex-46","name":"Standing Side Stretch","completions":6,"reps":"","bodyPosition":"Standing","bodyRegion":"Core","type":"Stretching","favorite":"No","primaryMuscle":"Obliques/Shoulders","routines":["S6"],"video":"https://www.youtube.com/shorts/QNw-mjxePb8","workOn":"No","muscleTags":["Core","Shoulders"]},{"id":"ex-47","name":"Twisted Lizard Pose","completions":15,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Stretching","favorite":"Favorite","primaryMuscle":"Quads/Hip Flexors/Back","routines":["S2","S8"],"video":"https://www.youtube.com/shorts/cDfFLpuSf00","workOn":"No","muscleTags":["Hips","Quads","Upper/Mid Back"]},{"id":"ex-48","name":"90/90 Internal Rotation Lift-Off","completions":16,"reps":"15 reps","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M1","M8"],"video":"https://www.youtube.com/shorts/f1wOPnBDQ6A","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-49","name":"Straight Leg Supine Twist","completions":13,"reps":"","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back/Glutes/Hamstrings","routines":["S4","S8"],"video":"https://www.youtube.com/shorts/Hui3Zl6nuRQ","workOn":"Work On","muscleTags":["Glutes","Hamstrings","Upper/Mid Back"]},{"id":"ex-50","name":"Double Knee to Chest Stretch","completions":8,"reps":"","bodyPosition":"On Back","bodyRegion":"Lower Back","type":"Stretching","favorite":"No","primaryMuscle":"Lower Back","routines":["S3"],"video":"https://www.youtube.com/watch?v=LugNxxfIdvo","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-51","name":"Standing Ankle Rolls","completions":9,"reps":"8 reps each direction","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles","routines":["M1"],"video":"https://www.youtube.com/watch?v=lsWnuKq9CDU","workOn":"No","muscleTags":["Ankles"]},{"id":"ex-52","name":"Quadruped Hip Flexed T-Spine Rotation","completions":9,"reps":"6 reps","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back","routines":["M2"],"video":"https://www.youtube.com/watch?v=8ybiPmUjd64","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-53","name":"Horizon Lunge","completions":6,"reps":"30 sec each side","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Back/Legs","routines":["M3"],"video":"https://www.youtube.com/shorts/xu0lGMoNSAk","workOn":"Work On","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-54","name":"Pistol Squat","completions":4,"reps":"5 reps each side","bodyPosition":"Standing","bodyRegion":"Quads","type":"Mobility","favorite":"No","primaryMuscle":"Quads/Knees","routines":["M13"],"video":"https://www.youtube.com/shorts/IfESGr170DY","workOn":"Work On","muscleTags":["Knees","Quads"]},{"id":"ex-55","name":"Single Leg Pogo Hops","completions":6,"reps":"30 reps each side","bodyPosition":"Standing","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Calves","routines":["M4"],"video":"https://www.youtube.com/watch?v=6yOw02lrmu8","workOn":"No","muscleTags":["Calves"]},{"id":"ex-56","name":"Toe Walk","completions":6,"reps":"25 reps each side","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles/Feet","routines":["M4"],"video":"https://www.youtube.com/shorts/2djYTirXUj4","workOn":"No","muscleTags":["Ankles","Feet"]},{"id":"ex-57","name":"On Side Quad Stretch","completions":14,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Quads","type":"Stretching","favorite":"No","primaryMuscle":"Quads","routines":["S3","S9"],"video":"https://www.youtube.com/shorts/nUoSkE8eJO8","workOn":"No","muscleTags":["Quads"]},{"id":"ex-58","name":"Floor Touch Knee Lockouts","completions":11,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hamstrings/Knees","routines":["S6","S8"],"video":"https://www.youtube.com/watch?v=QmbaZgbKCMs","workOn":"No","muscleTags":["Hamstrings","Knees"]},{"id":"ex-59","name":"Bench Straight Arm T-Spine Extension","completions":11,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Stretching","favorite":"Favorite","primaryMuscle":"Shoulders/Back","routines":["S6","S7"],"video":"https://www.youtube.com/watch?v=fAm9sxg6luc","workOn":"No","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-60","name":"Scorpion Stretch","completions":6,"reps":"5 reps each side","bodyPosition":"On Stomach","bodyRegion":"Lower Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Lower Back/Hip Flexors","routines":["M6"],"video":"https://www.youtube.com/shorts/xbRyRvwQXCc","workOn":"No","muscleTags":["Hips","Lower Back"]},{"id":"ex-61","name":"Neck CARs","completions":15,"reps":"5 reps each direction","bodyPosition":"Standing","bodyRegion":"Neck","type":"Mobility","favorite":"Favorite","primaryMuscle":"Neck","routines":["M1","M7"],"video":"https://www.youtube.com/shorts/SsPUcQTuuHs","workOn":"No","muscleTags":["Neck"]},{"id":"ex-62","name":"Wall Anterior Tibialis Raises","completions":6,"reps":"15 reps","bodyPosition":"Standing","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Tibialis","routines":["M3"],"video":"https://www.youtube.com/shorts/pQcvW08rnAk","workOn":"No","muscleTags":["Ankles","Calves"]},{"id":"ex-63","name":"Seated Spinal Twist","completions":13,"reps":"","bodyPosition":"Sitting","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back/Glutes","routines":["S3","S7"],"video":"https://www.youtube.com/watch?v=qEVNj4tcr0Y","workOn":"No","muscleTags":["Glutes","Upper/Mid Back"]},{"id":"ex-64","name":"90/90 w/ Torso Lean","completions":15,"reps":"8 reps","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M2","M7"],"video":"https://www.youtube.com/watch?v=ZwSUHCv1_7o","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-65","name":"Split Squats","completions":9,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Ankles/Hip Flexors","routines":["M2"],"video":"https://www.youtube.com/shorts/YuLqw3kHPaw","workOn":"No","muscleTags":["Ankles","Hips","Knees"]},{"id":"ex-66","name":"Standing Straight Arm Wall Pec Stretch","completions":8,"reps":"","bodyPosition":"Standing","bodyRegion":"Chest","type":"Stretching","favorite":"No","primaryMuscle":"Chest","routines":["S5"],"video":"https://www.youtube.com/watch?v=7E3fRg_mEr8&ab_channel=BoulderSportsClinic","workOn":"No","muscleTags":["Chest"]},{"id":"ex-67","name":"Banded Shoulder Dislocates","completions":15,"reps":"10 reps","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders","routines":["M1","M7"],"video":"https://www.youtube.com/watch?v=a9rqTzZaI7s","workOn":"Work On","muscleTags":["Shoulders"]},{"id":"ex-68","name":"Single Leg Seated Forward Fold","completions":8,"reps":"","bodyPosition":"Sitting","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings","routines":["S4"],"video":"https://www.youtube.com/shorts/kgNyGEjjdpg","workOn":"No","muscleTags":["Hamstrings"]},{"id":"ex-69","name":"Pigeon Pose","completions":14,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Glutes","type":"Stretching","favorite":"Favorite","primaryMuscle":"Glutes","routines":["S1","S7"],"video":"https://www.youtube.com/shorts/pjmR5Kacu1w","workOn":"Work On","muscleTags":["Glutes"]},{"id":"ex-70","name":"Kneeling Foot Stretch w/ Crossover Shoulder Stretch","completions":13,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Feet","type":"Stretching","favorite":"Favorite","primaryMuscle":"Feet/Shoulders","routines":["S3","S8"],"video":"https://www.youtube.com/shorts/kEoHxUQuuk8","workOn":"No","muscleTags":["Feet","Shoulders"]},{"id":"ex-71","name":"Lumbar Windshield Wipers","completions":9,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Lower Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Lower Back","routines":["M5","M16"],"video":"https://www.youtube.com/shorts/GRjPQhw9EJ4","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-72","name":"Wall Bicep Stretch","completions":7,"reps":"","bodyPosition":"Standing","bodyRegion":"Arms","type":"Stretching","favorite":"No","primaryMuscle":"Biceps/Shoulders","routines":["S6","S13"],"video":"https://www.youtube.com/shorts/j0rdJpN4B8Y","workOn":"No","muscleTags":["Arms","Shoulders"]},{"id":"ex-73","name":"Leaning Wall Calf Stretch","completions":13,"reps":"","bodyPosition":"Standing","bodyRegion":"Calves","type":"Stretching","favorite":"No","primaryMuscle":"Calves","routines":["S2","S12"],"video":"https://www.youtube.com/watch?v=nz1MIxo0jAQ&ab_channel=PropelPhysiotherapy","workOn":"No","muscleTags":["Calves"]},{"id":"ex-74","name":"Shoulder Extension End Range Lift-Offs","completions":6,"reps":"3 reps 10 sec hold each side","bodyPosition":"On Stomach","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders","routines":["M5"],"video":"https://www.youtube.com/shorts/IESGbbP__Wk","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-75","name":"Supine Pigeon Stretch","completions":14,"reps":"","bodyPosition":"On Back","bodyRegion":"Glutes","type":"Stretching","favorite":"No","primaryMuscle":"Glutes","routines":["S5","S9"],"video":"https://www.youtube.com/shorts/H7uxjbezdL4","workOn":"Work On","muscleTags":["Glutes"]},{"id":"ex-76","name":"Child's Pose on Elbows w/ Yoga Blocks","completions":9,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Stretching","favorite":"Favorite","primaryMuscle":"Shoulders/Triceps/Back","routines":["S4","S13"],"video":"https://www.youtube.com/shorts/2df2yjy1cwU","workOn":"Work On","muscleTags":["Arms","Shoulders","Upper/Mid Back"]},{"id":"ex-77","name":"Crab Stretch","completions":10,"reps":"","bodyPosition":"Sitting","bodyRegion":"Shoulders","type":"Stretching","favorite":"Favorite","primaryMuscle":"Shoulders/Biceps/Core","routines":["S10","S12"],"video":"https://www.youtube.com/watch?v=fjLO7la72qs","workOn":"Work On","muscleTags":["Arms","Core","Shoulders"]},{"id":"ex-78","name":"Kneeling Tibialis Stretch","completions":11,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Calves","type":"Stretching","favorite":"No","primaryMuscle":"Tibialis","routines":["S6","S7"],"video":"https://www.youtube.com/watch?v=HKp_m8G27Ic&ab_channel=TheSustainableTrainingMethod","workOn":"Work On","muscleTags":["Ankles","Calves"]},{"id":"ex-79","name":"Side Lying Adductor Leg Lifts","completions":6,"reps":"15 reps each side","bodyPosition":"On Back","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors","routines":["M5"],"video":"https://www.youtube.com/watch?v=dCpDLcHVomo","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-80","name":"Scap Pushup","completions":9,"reps":"10 reps","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back","routines":["M2"],"video":"https://www.youtube.com/watch?v=NKekqeudgWs","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-81","name":"Child's Pose Side Stretch","completions":13,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Lower Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Lower Back/Lats","routines":["S5","S7"],"video":"https://www.youtube.com/shorts/aZcP-ae2Jcw","workOn":"No","muscleTags":["Lower Back","Upper/Mid Back"]},{"id":"ex-82","name":"Standing Hip CARs","completions":6,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M9"],"video":"https://www.youtube.com/watch?v=K3OhDm57ZZU","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-83","name":"Supine Twist","completions":9,"reps":"","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back","routines":["S1"],"video":"https://www.youtube.com/shorts/ElKoMMaTPCM","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-84","name":"Hip Flexor Stretch w/ Overhead Diagonal Reach","completions":15,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Stretching","favorite":"No","primaryMuscle":"Hip Flexors/Obliques/Back","routines":["S5","S10"],"video":"https://www.youtube.com/watch?v=pUQ3s7eO-_A","workOn":"No","muscleTags":["Core","Hips","Upper/Mid Back"]},{"id":"ex-85","name":"Jefferson Curl","completions":13,"reps":"5 reps","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back/Hamstrings","routines":["M3","M8"],"video":"https://www.youtube.com/watch?v=YGlAdtSKQaU","workOn":"Work On","muscleTags":["Hamstrings","Upper/Mid Back"]},{"id":"ex-86","name":"Wide Stance Downward Dog","completions":6,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings/Calves/Back","routines":["S6"],"video":"https://www.youtube.com/shorts/T9ZA30LL-kY","workOn":"No","muscleTags":["Calves","Hamstrings","Upper/Mid Back"]},{"id":"ex-87","name":"90/90 Hip Switch","completions":6,"reps":"8 reps each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M3"],"video":"https://www.youtube.com/watch?v=BiSCSMqx-rE","workOn":"No","muscleTags":["Hips"]},{"id":"ex-88","name":"Seated Band Calf Stretch","completions":9,"reps":"","bodyPosition":"Sitting","bodyRegion":"Calves","type":"Stretching","favorite":"No","primaryMuscle":"Calves","routines":["S4","S13"],"video":"https://www.youtube.com/watch?v=uKePAWa2e6c","workOn":"No","muscleTags":["Calves"]},{"id":"ex-89","name":"Open Half Kneeling Ankle Mobilization w/ Manual Push","completions":13,"reps":"3 reps 15 sec each side","bodyPosition":"Kneeling","bodyRegion":"Ankles","type":"Mobility","favorite":"Favorite","primaryMuscle":"Ankles/Hips","routines":["M5","M8"],"video":"https://www.youtube.com/watch?v=1YT9eimOElQ","workOn":"No","muscleTags":["Ankles","Hips"]},{"id":"ex-90","name":"Child's Pose","completions":10,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Lower Back","type":"Stretching","favorite":"No","primaryMuscle":"Lower Back","routines":["S1","S14"],"video":"https://www.youtube.com/shorts/AgwjXQJqfYo","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-91","name":"Thread the Needle","completions":10,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back/Shoulders","routines":["S2"],"video":"https://www.youtube.com/shorts/h6_v-dZGLjY","workOn":"No","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-92","name":"Puppy Dog Stretch w/ Yoga Blocks","completions":9,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back/Shoulders","routines":["S5","S13"],"video":"https://www.youtube.com/watch?v=_-JgQJyqg7U","workOn":"Work On","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-93","name":"Inchworm to Plank","completions":9,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings/Core","routines":["S3","S13"],"video":"https://www.youtube.com/shorts/CeBwJ1TVV5w","workOn":"No","muscleTags":["Core","Hamstrings"]},{"id":"ex-94","name":"Seated Forward Fold","completions":9,"reps":"","bodyPosition":"Sitting","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings","routines":["S3","S14"],"video":"https://www.youtube.com/shorts/5njnlgYYdD4","workOn":"Work On","muscleTags":["Hamstrings"]},{"id":"ex-95","name":"90/90 w/ Shin Box","completions":6,"reps":"6 reps each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M5"],"video":"https://www.youtube.com/shorts/9nhhZIpIZ7A","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-96","name":"Banded Lateral Walks","completions":6,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Glutes","type":"Mobility","favorite":"No","primaryMuscle":"Glutes/Hips/Knees","routines":["M4"],"video":"https://www.youtube.com/watch?v=i0w7KczRvkk","workOn":"No","muscleTags":["Glutes","Hips","Knees"]},{"id":"ex-97","name":"Spiderman Lunge w/ Rotation + Hamstring Mobilization","completions":6,"reps":"5 reps each side","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Mobility","favorite":"Favorite","primaryMuscle":"Quads/Back/Hamstrings","routines":["M5"],"video":"https://www.youtube.com/watch?v=JFIrqEZ8IoM&ab_channel=ChampionPhysicalTherapyandPerformance","workOn":"No","muscleTags":["Hamstrings","Quads","Upper/Mid Back"]},{"id":"ex-98","name":"Downward Dog to Alternating Toe Tap","completions":6,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Mobility","favorite":"No","primaryMuscle":"Hamstrings/Calves/Back/Core","routines":["M5"],"video":"https://www.youtube.com/watch?v=6f75d3IsOsc","workOn":"No","muscleTags":["Calves","Core","Hamstrings","Upper/Mid Back"]},{"id":"ex-99","name":"Seated Bicep Stretch","completions":13,"reps":"","bodyPosition":"Sitting","bodyRegion":"Arms","type":"Stretching","favorite":"Favorite","primaryMuscle":"Biceps","routines":["S3","S7"],"video":"https://www.youtube.com/watch?v=IYlXSQLDHmo","workOn":"No","muscleTags":["Arms"]},{"id":"ex-100","name":"Lower Back Isolation Cat-Cow Circles","completions":6,"reps":"8 reps each direction","bodyPosition":"Kneeling","bodyRegion":"Lower Back","type":"Mobility","favorite":"No","primaryMuscle":"Lower Back","routines":["M3"],"video":"https://www.youtube.com/shorts/1KJ9O5I2fsY","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-101","name":"Standing Lateral Line Stretch","completions":15,"reps":"5 reps 5 sec hold","bodyPosition":"Standing","bodyRegion":"Core","type":"Mobility","favorite":"Favorite","primaryMuscle":"Obliques/Shoulders/Back","routines":["M2","M7"],"video":"https://www.youtube.com/watch?v=oZuzBmKA_co","workOn":"Work On","muscleTags":["Core","Shoulders","Upper/Mid Back"]},{"id":"ex-102","name":"Banded Downward Dog Knee Extensions","completions":6,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Hamstrings","routines":["M5"],"video":"https://www.youtube.com/watch?v=1IMmm_Q3xlY","workOn":"No","muscleTags":["Hamstrings","Knees"]},{"id":"ex-103","name":"Supine Twist w/ Overhead Arm Half Circles","completions":11,"reps":"","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back/Shoulders/Chest","routines":["S6","S8"],"video":"https://www.youtube.com/shorts/ElKoMMaTPCM","workOn":"No","muscleTags":["Chest","Shoulders","Upper/Mid Back"]},{"id":"ex-104","name":"Lizard Pose","completions":13,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hip Flexors/Quads","routines":["S2","S11"],"video":"https://www.youtube.com/shorts/UyHxMrjodsw","workOn":"No","muscleTags":["Hips","Quads"]},{"id":"ex-105","name":"Heel Drop Stretch","completions":11,"reps":"","bodyPosition":"Standing","bodyRegion":"Calves","type":"Stretching","favorite":"Favorite","primaryMuscle":"Calves/Achilles","routines":["S6","S7"],"video":"https://www.youtube.com/watch?v=3tc0lN_bW5o&ab_channel=AaronSwanson","workOn":"No","muscleTags":["Calves"]},{"id":"ex-106","name":"Lat Stretch on Pole","completions":10,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back","routines":["S2"],"video":"https://www.youtube.com/watch?v=atolSgSvSKc","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-107","name":"Seated Figure-Four Stretch","completions":11,"reps":"","bodyPosition":"Sitting","bodyRegion":"Glutes","type":"Stretching","favorite":"No","primaryMuscle":"Glutes","routines":["S4","S12"],"video":"https://www.youtube.com/watch?v=2E8WWX4cOc4","workOn":"Work On","muscleTags":["Glutes"]},{"id":"ex-108","name":"Child\u2019s Pose on Fingertips","completions":15,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Chest","type":"Stretching","favorite":"No","primaryMuscle":"Chest","routines":["S4","S10"],"video":"https://www.youtube.com/watch?v=56nNDhYyjc8","workOn":"No","muscleTags":["Chest"]},{"id":"ex-109","name":"Loaded Ankle Rock","completions":15,"reps":"3 reps 10 sec hold","bodyPosition":"Kneeling","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles","routines":["M2","M7"],"video":"https://www.youtube.com/shorts/t0dW_gbaQG0","workOn":"No","muscleTags":["Ankles"]},{"id":"ex-110","name":"Standing Hip Circles","completions":6,"reps":"8 reps each direction","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M10"],"video":"https://www.youtube.com/shorts/fhosmniT48I","workOn":"No","muscleTags":["Hips"]},{"id":"ex-111","name":"Cat-Cow","completions":15,"reps":"8 reps","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back","routines":["M1","M7"],"video":"https://www.youtube.com/shorts/FV1zid_h6vQ","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-112","name":"Standing Wrist Flexor/Extensor","completions":9,"reps":"3 reps each direction 5 sec hold","bodyPosition":"Standing","bodyRegion":"Wrist","type":"Mobility","favorite":"No","primaryMuscle":"Wrist","routines":["M1"],"video":"https://www.youtube.com/watch?v=_uINTR_7X-g","workOn":"No","muscleTags":["Wrist"]},{"id":"ex-113","name":"Double Flat Needle Pose","completions":13,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Shoulders","type":"Stretching","favorite":"No","primaryMuscle":"Shoulders","routines":["S3","S8"],"video":"https://www.youtube.com/watch?v=l4vpV-sJ30E","workOn":"Work On","muscleTags":["Shoulders"]},{"id":"ex-114","name":"Side Lying Banded Hip Abduction","completions":12,"reps":"10 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Abductors","routines":["M5","M7"],"video":"https://www.youtube.com/shorts/gtMh-SfRyM8","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-115","name":"Plank Hip Dips","completions":6,"reps":"10 reps each side","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Mobility","favorite":"No","primaryMuscle":"Core/Hips","routines":["M9"],"video":"https://www.youtube.com/shorts/wspKLRGQxIc","workOn":"No","muscleTags":["Core","Hips"]},{"id":"ex-116","name":"Downward Dog Hip Opener","completions":9,"reps":"6 reps","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Mobility","favorite":"No","primaryMuscle":"Hamstrings/Calves/Back/Hips","routines":["M1"],"video":"https://www.youtube.com/shorts/VhFihuVixGQ","workOn":"Work On","muscleTags":["Calves","Hamstrings","Hips","Upper/Mid Back"]},{"id":"ex-117","name":"Horizontal Hand Rotations","completions":9,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders","routines":["M2"],"video":"https://www.youtube.com/watch?v=wt01Ze7sezg","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-118","name":"Toe Up on Wall Calf Stretch","completions":15,"reps":"","bodyPosition":"Standing","bodyRegion":"Calves","type":"Stretching","favorite":"No","primaryMuscle":"Calves","routines":["S5","S10"],"video":"https://www.youtube.com/shorts/mtVqe4CR_60","workOn":"No","muscleTags":["Calves"]},{"id":"ex-119","name":"Shin on Wall Quad Stretch","completions":11,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Stretching","favorite":"Favorite","primaryMuscle":"Quads","routines":["S4","S12"],"video":"https://www.youtube.com/watch?v=MZXCC6kY07A","workOn":"Work On","muscleTags":["Quads"]},{"id":"ex-120","name":"Standing Upper Body Circles","completions":9,"reps":"4 reps each direction","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back/Core","routines":["M5","M16"],"video":"https://www.youtube.com/watch?v=vETeWZbIRLI","workOn":"No","muscleTags":["Core","Upper/Mid Back"]},{"id":"ex-121","name":"Bird Dog","completions":6,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Core","type":"Mobility","favorite":"No","primaryMuscle":"Core/Shoulders/Glutes","routines":["M3"],"video":"https://www.youtube.com/shorts/YO9bbyrgJkI","workOn":"No","muscleTags":["Core","Glutes","Shoulders"]},{"id":"ex-122","name":"Cossack Squat w/ Internal Rotation","completions":9,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"Favorite","primaryMuscle":"Adductors/Hips","routines":["M10","M16"],"video":"https://www.youtube.com/shorts/4MJFgaaH1UI","workOn":"Work On","muscleTags":["Adductors","Hips"]},{"id":"ex-123","name":"Kneeling Wrist Circles","completions":12,"reps":"4 reps each direction / each side","bodyPosition":"Kneeling","bodyRegion":"Wrist","type":"Mobility","favorite":"Favorite","primaryMuscle":"Wrist","routines":["M3","M7"],"video":"https://www.youtube.com/shorts/WflnMuxxW7I","workOn":"No","muscleTags":["Wrist"]},{"id":"ex-124","name":"Half Kneel Hip Rock to Hamstring Mobilization","completions":4,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Hamstrings","routines":["M11"],"video":"https://www.youtube.com/watch?v=Xb1Ip-xXFVI","workOn":"No","muscleTags":["Hamstrings","Hips"]},{"id":"ex-125","name":"Kneeling Wrist Flexor/Extensor","completions":9,"reps":"30 sec each direction","bodyPosition":"Kneeling","bodyRegion":"Wrist","type":"Mobility","favorite":"No","primaryMuscle":"Wrist","routines":["M2"],"video":"https://www.youtube.com/shorts/F_NAKveOUbY","workOn":"No","muscleTags":["Wrist"]},{"id":"ex-126","name":"Eagle Stretch","completions":13,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Stretching","favorite":"No","primaryMuscle":"Shoulders/Arms","routines":["S5","S8"],"video":"https://www.youtube.com/shorts/m1EHwX8UMkg","workOn":"Work On","muscleTags":["Arms","Shoulders"]},{"id":"ex-127","name":"Dragon Pose","completions":9,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Stretching","favorite":"No","primaryMuscle":"Hip Flexors/Quads/Groin","routines":["S1"],"video":"https://www.youtube.com/shorts/X9Qtf0jjd2o","workOn":"No","muscleTags":["Adductors","Hips","Quads"]},{"id":"ex-128","name":"Toe Squat","completions":13,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"Favorite","primaryMuscle":"Ankles/Quads/Feet/Knees","routines":["M6","M8"],"video":"https://www.youtube.com/shorts/KIrCxAa_gaA","workOn":"Work On","muscleTags":["Ankles","Feet","Knees","Quads"]},{"id":"ex-129","name":"Wall Overhead Shoulder Stretch","completions":14,"reps":"","bodyPosition":"Standing","bodyRegion":"Shoulders","type":"Stretching","favorite":"Favorite","primaryMuscle":"Shoulders","routines":["S4","S9"],"video":"https://www.youtube.com/watch?v=vXLn7kRD5ek","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-130","name":"Standing Straight Front Leg Hamstring Stretch","completions":9,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hamstrings","routines":["S9","S11"],"video":"https://www.youtube.com/shorts/Yi77TzNoafQ","workOn":"No","muscleTags":["Hamstrings"]},{"id":"ex-131","name":"Overhead Tricep Stretch","completions":13,"reps":"","bodyPosition":"Standing","bodyRegion":"Arms","type":"Stretching","favorite":"No","primaryMuscle":"Triceps","routines":["S2","S11"],"video":"https://www.youtube.com/shorts/_IOHtPSYGbk","workOn":"No","muscleTags":["Arms"]},{"id":"ex-132","name":"Wide Legged Forward Fold","completions":7,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"No","primaryMuscle":"Hamstrings/Lower Back/Adductors","routines":["S10"],"video":"https://www.youtube.com/shorts/FLVlV33mLyI","workOn":"No","muscleTags":["Adductors","Hamstrings","Lower Back"]},{"id":"ex-133","name":"Seated Banded Ankle Inversion","completions":4,"reps":"10 twists each direction each side","bodyPosition":"Sitting","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles","routines":["M14"],"video":"https://www.youtube.com/watch?v=wJXzCKIjaT4&ab_channel=OrthoIndy","workOn":"No","muscleTags":["Ankles"]},{"id":"ex-134","name":"Standing Crossed Leg Hamstring Stretch","completions":7,"reps":"","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Stretching","favorite":"Favorite","primaryMuscle":"Hamstrings","routines":["S10"],"video":"https://www.youtube.com/watch?v=iitjUTLJ77Q","workOn":"No","muscleTags":["Hamstrings"]},{"id":"ex-135","name":"Crow Pose","completions":0,"reps":"4 reps 10 sec hold","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Knees/Shoulders/Wrists","routines":[],"video":"https://www.youtube.com/shorts/GS9ByU3IVXY","workOn":"","muscleTags":["Hips","Knees","Shoulders","Wrist"]},{"id":"ex-136","name":"Open Book Stretch","completions":1,"reps":"","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"","primaryMuscle":"Back/Shoulders","routines":["S13"],"video":"https://www.youtube.com/watch?v=93C-PRmMra0","workOn":"","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-137","name":"Single Leg Pogo Hops","completions":6,"reps":"25 reps each side","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankle/Calves","routines":["M10"],"video":"https://www.youtube.com/shorts/_pDStuHcvTc","workOn":"No","muscleTags":["Ankles","Calves"]},{"id":"ex-138","name":"Ankle Plantar Flexion","completions":6,"reps":"20 sec hold each direction each side","bodyPosition":"Kneeling","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles/Feet","routines":["M10"],"video":"https://www.youtube.com/watch?v=z9rRP79F0zI&ab_channel=KURUFootwear","workOn":"No","muscleTags":["Ankles","Feet"]},{"id":"ex-139","name":"Squat with Band on Knees","completions":0,"reps":"10 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.youtube.com/watch?v=XjW00-M98Bs","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-140","name":"Seated Hip Flexor Lift Over","completions":3,"reps":"8 each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M15"],"video":"https://www.youtube.com/watch?v=10qPbDrC5sU","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-141","name":"Standing Single Leg 4 Way Leg Reach","completions":6,"reps":"3 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Ankles/Hips","routines":["M10"],"video":"https://www.youtube.com/shorts/dDM6tIwVxfc","workOn":"Work On","muscleTags":["Ankles","Hips","Knees"]},{"id":"ex-142","name":"Lateral Bound and Stick","completions":0,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.youtube.com/watch?v=vbHLWvhNoOg","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-143","name":"Box Step with Rotation to Archer Stretch","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Back/Core","routines":[],"video":"https://www.youtube.com/watch?v=gjZ2UdWpIKk","workOn":"","muscleTags":["Core","Hips","Upper/Mid Back"]},{"id":"ex-144","name":"Elevated Wrist Extensions","completions":7,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Arms","type":"Stretching","favorite":"No","primaryMuscle":"Forearms/Wrist","routines":["S9","S14"],"video":"https://www.youtube.com/watch?v=uTPH_EL78YA","workOn":"No","muscleTags":["Arms","Wrist"]},{"id":"ex-145","name":"Big Toe Heel Sit","completions":6,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Feet","type":"Stretching","favorite":"No","primaryMuscle":"Feet","routines":["S9"],"video":"https://www.youtube.com/watch?v=dvIOkZ_zsGI","workOn":"No","muscleTags":["Feet"]},{"id":"ex-146","name":"Supported Coil Stretch","completions":7,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back/Shoulders","routines":["S10"],"video":"https://www.youtube.com/watch?v=vKdGAOhuuDM","workOn":"Work On","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-147","name":"Lower Back Extension - Hands Interlaced Behind Back","completions":6,"reps":"6 reps 3 sec hold","bodyPosition":"On Stomach","bodyRegion":"Lower Back","type":"Mobility","favorite":"No","primaryMuscle":"Lower Back/Shoulders","routines":["M9"],"video":"https://www.youtube.com/watch?v=or93ikTRMjg","workOn":"No","muscleTags":["Lower Back","Shoulders"]},{"id":"ex-148","name":"Bridge Pose","completions":6,"reps":"8 reps","bodyPosition":"On Back","bodyRegion":"Glutes","type":"Mobility","favorite":"No","primaryMuscle":"Glutes","routines":["M9"],"video":"https://www.youtube.com/watch?v=h-jM6Br-F6s","workOn":"No","muscleTags":["Glutes"]},{"id":"ex-149","name":"Roll to Straddle","completions":0,"reps":"8 reps","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Back","routines":[],"video":"https://www.youtube.com/watch?v=CrmsX4KazUc","workOn":"","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-150","name":"Squats with Hip Internal Rotation","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Hips/Quads","routines":[],"video":"https://www.youtube.com/watch?v=6T6Dl6tD0Ag","workOn":"","muscleTags":["Hips","Knees","Quads"]},{"id":"ex-151","name":"Side Lying Adductor Raise Circles","completions":6,"reps":"8 reps each direction each side","bodyPosition":"On Back","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors","routines":["M9"],"video":"https://www.youtube.com/watch?v=O4aOWDZ5-is","workOn":"No","muscleTags":["Adductors"]},{"id":"ex-152","name":"Leaning Single Leg Calf Raises","completions":6,"reps":"15 reps each side","bodyPosition":"Standing","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Calves","routines":["M10"],"video":"https://www.youtube.com/watch?v=fImnRERTRNo","workOn":"No","muscleTags":["Calves"]},{"id":"ex-153","name":"90/90 Hip Switch Lean/Lift Off","completions":7,"reps":"6 reps each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M14","M15"],"video":"https://www.youtube.com/watch?v=T3oWz1xrjO8","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-154","name":"Wide Heel Sit Thread the Needle","completions":6,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back/Hips","routines":["M10"],"video":"https://www.youtube.com/watch?v=85EoDl266N0","workOn":"No","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-155","name":"Forward Fold to Overhead Reach","completions":6,"reps":"6 reps","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hamstrings/Back/Core","routines":["M9"],"video":"https://www.youtube.com/watch?v=Rb32kB_021I","workOn":"No","muscleTags":["Core","Hamstrings","Upper/Mid Back"]},{"id":"ex-156","name":"Knee Drive to Staggered Squat to Lateral Lunge","completions":0,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.youtube.com/watch?v=wyuDgavfajM","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-157","name":"Split Squat Rotation Stretch on Pole","completions":6,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back/Shoulders","routines":["S9"],"video":"https://www.youtube.com/watch?v=SvvQG0nna0w","workOn":"Work On","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-158","name":"Elevated Hip Flexor Drop Downs","completions":3,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips","routines":["M16"],"video":"https://www.youtube.com/watch?v=4obwnpwMu14","workOn":"No","muscleTags":["Hips"]},{"id":"ex-159","name":"Athletic Reverse Lunge w/ Twist","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Hips/Quads","routines":[],"video":"https://www.youtube.com/watch?v=Vqnqihgj0b4","workOn":"","muscleTags":["Hips","Knees","Quads"]},{"id":"ex-160","name":"Toe Touch Squat to Overhead Reach","completions":0,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Back","routines":[],"video":"https://www.youtube.com/watch?v=5PtcI0nI2Uw","workOn":"","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-161","name":"Inchworm to Spiderman","completions":0,"reps":"5 reps","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Core/Hamstrings","routines":[],"video":"https://www.youtube.com/watch?v=qgXjg2kbY_w","workOn":"","muscleTags":["Core","Hamstrings","Hips"]},{"id":"ex-162","name":"Single Leg Deadlift w/ Reach to Reaching Knee Drive","completions":5,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips/Knees/Shoulders","routines":["M12"],"video":"https://www.youtube.com/watch?v=ib6npM3ifas","workOn":"Work On","muscleTags":["Hips","Knees","Shoulders"]},{"id":"ex-163","name":"Split Stance Adductor Stretch w/ T-Spine Reach","completions":0,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Back","routines":[],"video":"https://www.youtube.com/watch?v=R6mPJOKfDRg","workOn":"","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-164","name":"Curtsy Lunge","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Quads","routines":[],"video":"https://www.youtube.com/watch?v=_ECK_Z_yjHI","workOn":"","muscleTags":["Hips","Quads"]},{"id":"ex-165","name":"Elevated Pigeon Stretch w/ Rotation","completions":6,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Glutes","type":"Mobility","favorite":"Favorite","primaryMuscle":"Glutes/Hips","routines":["M10"],"video":"https://www.youtube.com/watch?v=pNzVOKOj17I","workOn":"Work On","muscleTags":["Glutes","Hips"]},{"id":"ex-166","name":"Prone Shoulder Rotations","completions":6,"reps":"8 reps","bodyPosition":"On Stomach","bodyRegion":"Shoulders","type":"Mobility","favorite":"No","primaryMuscle":"Shoulders/Lower Back","routines":["M9"],"video":"https://www.youtube.com/watch?v=_rfRIl4dQ9E","workOn":"Work On","muscleTags":["Lower Back","Shoulders"]},{"id":"ex-167","name":"Heel Sit Neck Nods","completions":9,"reps":"8 reps","bodyPosition":"Kneeling","bodyRegion":"Neck","type":"Mobility","favorite":"No","primaryMuscle":"Neck","routines":["M9","M15"],"video":"https://www.youtube.com/watch?v=3X-b0Sdv-q0&list=PLGgD7uaxG2kY_P0owAAszzBIvFSC7Pvzp","workOn":"No","muscleTags":["Neck"]},{"id":"ex-168","name":"Reach, Roll, Lift","completions":9,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Mobility","favorite":"Favorite","primaryMuscle":"Shoulders","routines":["M10","M16"],"video":"https://www.youtube.com/watch?v=HVbFD-Dozz4","workOn":"No","muscleTags":["Shoulders"]},{"id":"ex-169","name":"Single Leg Supported Skater Squat","completions":3,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees/Hips","routines":["M15"],"video":"https://www.youtube.com/watch?v=WwQMCIxdGCk","workOn":"Work On","muscleTags":["Hips","Knees"]},{"id":"ex-170","name":"Foot on Box Lateral Single Leg Pogo Hops","completions":5,"reps":"20 each side","bodyPosition":"Standing","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Calves/Ankles","routines":["M12"],"video":"https://www.youtube.com/watch?v=VfA1PrZcBAI","workOn":"No","muscleTags":["Ankles","Calves"]},{"id":"ex-171","name":"Side Lying T-Spine Archer","completions":6,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back","routines":["M9"],"video":"https://www.youtube.com/watch?v=008gQe87ktc","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-172","name":"Single Leg Glute Bridge w/ Leg Whip","completions":6,"reps":"6 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Core/Glutes","routines":["M9"],"video":"https://www.youtube.com/watch?v=4psvBlEy09s","workOn":"Work On","muscleTags":["Core","Glutes","Hips"]},{"id":"ex-173","name":"Shin on Wall Quad Stretch w/ Rotation","completions":8,"reps":"","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Stretching","favorite":"Favorite","primaryMuscle":"Quads/Back","routines":["S10","S14"],"video":"https://www.youtube.com/watch?v=zPsZ-73-J8c","workOn":"No","muscleTags":["Quads","Upper/Mid Back"]},{"id":"ex-174","name":"Single Leg Deadlift with Cross Body Reach","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Hamstrings","routines":[],"video":"https://www.youtube.com/watch?v=5BG0n05CWiE","workOn":"","muscleTags":["Hamstrings","Hips"]},{"id":"ex-175","name":"Deep Squat Hold Calf Raises","completions":0,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"","primaryMuscle":"Ankles/Hips","routines":[],"video":"https://www.youtube.com/shorts/k0xU-Ux7C-o","workOn":"","muscleTags":["Ankles","Hips"]},{"id":"ex-176","name":"Supine Single Leg Banded Anterior Tibialis Raises","completions":4,"reps":"10 reps each side","bodyPosition":"On Back","bodyRegion":"Calves","type":"Mobility","favorite":"No","primaryMuscle":"Tibialis","routines":["M14"],"video":"https://www.youtube.com/watch?v=j-IHNgkQQ0k","workOn":"No","muscleTags":["Ankles","Calves"]},{"id":"ex-177","name":"Half Kneeling Wall T-Spine Rotations","completions":5,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Back/Shoulder","routines":["M12"],"video":"https://www.youtube.com/shorts/NuDipJO6uck","workOn":"No","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-178","name":"Wall Sit - Heels Elevated","completions":3,"reps":"12 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees/Quads","routines":["M16"],"video":"https://www.youtube.com/watch?v=jB_OpVfFRVM","workOn":"No","muscleTags":["Knees","Quads"]},{"id":"ex-179","name":"Lunge with Thoracic Rotation","completions":4,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Spine/Hip Flexors","routines":["M13"],"video":"https://www.instagram.com/p/DC4Vou0Reba/","workOn":"Work On","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-180","name":"Cossack Squat with Side Bend Stretch","completions":4,"reps":"5 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips/Lats","routines":["M13"],"video":"https://www.instagram.com/p/DC4Vou0Reba/","workOn":"Work On","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-181","name":"Squat with Calf Raises","completions":4,"reps":"10 reps","bodyPosition":"Standing","bodyRegion":"Ankles","type":"Mobility","favorite":"No","primaryMuscle":"Ankles/Quads","routines":["M13"],"video":"https://www.youtube.com/shorts/Ax-gkDEAaEE","workOn":"Work On","muscleTags":["Ankles","Quads"]},{"id":"ex-182","name":"Supermans with Rotations","completions":9,"reps":"8 reps","bodyPosition":"On Stomach","bodyRegion":"Lower Back","type":"Mobility","favorite":"No","primaryMuscle":"Lower Back/Spine","routines":["M14","M12"],"video":"https://www.instagram.com/p/DDkH2YOO5qT/","workOn":"No","muscleTags":["Lower Back","Upper/Mid Back"]},{"id":"ex-183","name":"Bi-Lateral Elephant Walk","completions":7,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Hamstrings","type":"Mobility","favorite":"No","primaryMuscle":"Hamstrings/Hips","routines":["M13","M15"],"video":"https://www.instagram.com/p/DDkH2YOO5qT/","workOn":"No","muscleTags":["Hamstrings","Hips"]},{"id":"ex-184","name":"Low Squat Y Raises","completions":4,"reps":"10 reps","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back/Shoulders/Hips","routines":["M14"],"video":"https://www.instagram.com/p/DDkH2YOO5qT/","workOn":"Work On","muscleTags":["Hips","Shoulders","Upper/Mid Back"]},{"id":"ex-185","name":"Side Plank Clamshell Hip Raises","completions":3,"reps":"8 reps each side","bodyPosition":"On Stomach","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors/Hips/Core","routines":["M15"],"video":"https://www.instagram.com/p/DGBM8cguNPw/","workOn":"Work On","muscleTags":["Adductors","Core","Hips"]},{"id":"ex-186","name":"Toe Grab Twist","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Spine","routines":[],"video":"https://www.instagram.com/p/DGTUQnDR4UJ/","workOn":"","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-187","name":"Knee Circles","completions":5,"reps":"6 reps each direction each side","bodyPosition":"Kneeling","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Hips","routines":["M12"],"video":"https://www.instagram.com/p/DGTUQnDR4UJ/","workOn":"No","muscleTags":["Hips","Knees"]},{"id":"ex-188","name":"Side Leaning Banded Couch Stretch","completions":3,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Quads","type":"Mobility","favorite":"Favorite","primaryMuscle":"Quads/Obliques","routines":["M16"],"video":"https://www.instagram.com/p/DGTUQnDR4UJ/","workOn":"Work On","muscleTags":["Core","Quads"]},{"id":"ex-189","name":"90 Degree Banded Kickouts","completions":4,"reps":"10 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees","routines":["M11"],"video":"https://www.instagram.com/p/DGEMBJRPa4K/","workOn":"No","muscleTags":["Knees"]},{"id":"ex-190","name":"Banded Hip External Rotation on Wall","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"","primaryMuscle":"Adductors/Hips","routines":[],"video":"https://www.instagram.com/p/DGg1RIhP-x-/","workOn":"","muscleTags":["Adductors","Hips"]},{"id":"ex-191","name":"Standing Banded Knee Raises","completions":4,"reps":"10 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hip Flexors","routines":["M11"],"video":"https://www.instagram.com/p/DGg1RIhP-x-/","workOn":"No","muscleTags":["Hips"]},{"id":"ex-192","name":"Banded Monster Walk","completions":5,"reps":"10 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors/Glutes","routines":["M12"],"video":"https://www.instagram.com/p/DGg1RIhP-x-/","workOn":"No","muscleTags":["Adductors","Glutes"]},{"id":"ex-193","name":"Banded Forward & Reverse Walk","completions":4,"reps":"10 reps each side","bodyPosition":"Standing","bodyRegion":"Adductors","type":"Mobility","favorite":"No","primaryMuscle":"Adductors/Glutes","routines":["M14"],"video":"https://www.instagram.com/p/DGg1RIhP-x-/","workOn":"No","muscleTags":["Adductors","Glutes"]},{"id":"ex-194","name":"Single Leg Banded Hip Bridges","completions":4,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Glutes","type":"Mobility","favorite":"No","primaryMuscle":"Glutes","routines":["M11"],"video":"https://www.instagram.com/p/DGg1RIhP-x-/","workOn":"No","muscleTags":["Glutes"]},{"id":"ex-195","name":"Side Lying Pretzel","completions":3,"reps":"","bodyPosition":"On Back","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back","routines":["S11"],"video":"https://www.instagram.com/p/DG0w1N_xACK/","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-196","name":"Side Lying Toe Taps","completions":0,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Lower Back","routines":[],"video":"https://www.instagram.com/p/DG0w1N_xACK/","workOn":"","muscleTags":["Hips","Lower Back"]},{"id":"ex-197","name":"Frog Pose Shoulder Switches","completions":7,"reps":"8 reps each side","bodyPosition":"Kneeling","bodyRegion":"Shoulders","type":"Mobility","favorite":"Favorite","primaryMuscle":"Shoulders/Back/Hips","routines":["M11","M15"],"video":"https://www.instagram.com/p/DG0w1N_xACK/","workOn":"No","muscleTags":["Hips","Shoulders","Upper/Mid Back"]},{"id":"ex-198","name":"Heel Taps","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.instagram.com/p/DCUs71ePKVQ/","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-199","name":"Split Squat Knee Rotations","completions":0,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.instagram.com/p/DCUs71ePKVQ/","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-200","name":"Sphinx Neck Circles","completions":4,"reps":"6 circles each direction","bodyPosition":"On Stomach","bodyRegion":"Neck","type":"Mobility","favorite":"No","primaryMuscle":"Neck","routines":["M11"],"video":"https://www.instagram.com/p/DGlw4LbS_m1/","workOn":"No","muscleTags":["Neck"]},{"id":"ex-201","name":"Open Hip Cobra Press","completions":4,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Stretching","favorite":"No","primaryMuscle":"Abs/Hips","routines":["S11","S14"],"video":"https://www.instagram.com/p/DGlw4LbS_m1/","workOn":"No","muscleTags":["Core","Hips"]},{"id":"ex-202","name":"Bridge Chest Opener","completions":3,"reps":"","bodyPosition":"On Back","bodyRegion":"Chest","type":"Stretching","favorite":"No","primaryMuscle":"Chest/Glutes","routines":["S11"],"video":"https://www.instagram.com/p/DGlw4LbS_m1/","workOn":"No","muscleTags":["Chest","Glutes"]},{"id":"ex-203","name":"Supine Internal Hip Twist","completions":3,"reps":"","bodyPosition":"On Back","bodyRegion":"Lower Back","type":"Stretching","favorite":"No","primaryMuscle":"Back/Hips","routines":["S11"],"video":"https://www.instagram.com/p/DGlw4LbS_m1/","workOn":"No","muscleTags":["Hips","Lower Back","Upper/Mid Back"]},{"id":"ex-204","name":"Straddle Raises","completions":5,"reps":"8 reps","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hip Flexors","routines":["M12"],"video":"https://www.instagram.com/p/DG_B_W9MrFU/","workOn":"Work On","muscleTags":["Hips"]},{"id":"ex-205","name":"Banded Knee Circles","completions":4,"reps":"6 reps each direction each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees/Adductors","routines":["M13"],"video":"https://www.instagram.com/p/DEDvLksRYkr/","workOn":"Work On","muscleTags":["Adductors","Knees"]},{"id":"ex-206","name":"Squat Fold to Heel Sit","completions":0,"reps":"5 reps","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"","primaryMuscle":"Knees/Quads","routines":[],"video":"https://www.instagram.com/p/DHjDHcooKWn/","workOn":"","muscleTags":["Knees","Quads"]},{"id":"ex-207","name":"Squat Heel Sit Rotation","completions":3,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Hips","routines":["M16"],"video":"https://www.instagram.com/p/DHjDHcooKWn/","workOn":"No","muscleTags":["Hips","Knees"]},{"id":"ex-208","name":"Front Cross Dragon Kick","completions":4,"reps":"5 reps each side","bodyPosition":"Standing","bodyRegion":"Knees","type":"Mobility","favorite":"No","primaryMuscle":"Knees/Core/Hips","routines":["M14"],"video":"https://www.instagram.com/p/DHjDHcooKWn/","workOn":"Work On","muscleTags":["Core","Hips","Knees"]},{"id":"ex-209","name":"Banded Big Hip Circles","completions":0,"reps":"8 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Hamstrings","routines":[],"video":"https://www.instagram.com/p/DIrPxBURhf9/","workOn":"","muscleTags":["Hamstrings","Hips"]},{"id":"ex-210","name":"Banded Quad Stretch","completions":4,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Quads","type":"Stretching","favorite":"No","primaryMuscle":"Quads/Hip Flexors","routines":["S11","S13"],"video":"https://www.instagram.com/p/DIrPxBURhf9/","workOn":"No","muscleTags":["Hips","Quads"]},{"id":"ex-211","name":"Wrist Push Ups","completions":7,"reps":"10 reps","bodyPosition":"Kneeling","bodyRegion":"Wrist","type":"Mobility","favorite":"Favorite","primaryMuscle":"Wrist","routines":["M11","M15"],"video":"https://www.instagram.com/p/DJFyiR_ySbO/","workOn":"No","muscleTags":["Wrist"]},{"id":"ex-212","name":"Knuckle Push Ups","completions":7,"reps":"12 reps","bodyPosition":"Kneeling","bodyRegion":"Wrist","type":"Mobility","favorite":"Favorite","primaryMuscle":"Wrist","routines":["M13","M16"],"video":"https://www.instagram.com/p/DJFyiR_ySbO/","workOn":"Work On","muscleTags":["Wrist"]},{"id":"ex-213","name":"Fist Rocks","completions":5,"reps":"10 reps","bodyPosition":"Kneeling","bodyRegion":"Wrist","type":"Mobility","favorite":"No","primaryMuscle":"Wrist","routines":["M12"],"video":"https://www.instagram.com/p/DJFyiR_ySbO/","workOn":"No","muscleTags":["Wrist"]},{"id":"ex-214","name":"Banded Kneeling Cat Cows","completions":4,"reps":"8 reps","bodyPosition":"Kneeling","bodyRegion":"Lower Back","type":"Mobility","favorite":"Favorite","primaryMuscle":"Lower Back","routines":["M11"],"video":"https://www.instagram.com/p/DJB5k69sLSu/","workOn":"No","muscleTags":["Lower Back"]},{"id":"ex-215","name":"Alternating Pigeon Lunges","completions":8,"reps":"6 reps each side","bodyPosition":"Kneeling","bodyRegion":"Glutes","type":"Mobility","favorite":"Favorite","primaryMuscle":"Glutes","routines":["M12","M15"],"video":"https://www.instagram.com/p/DDeBpF2Rs7H/","workOn":"Work On","muscleTags":["Glutes"]},{"id":"ex-216","name":"Cobra Shifts","completions":4,"reps":"8 reps each side","bodyPosition":"On Stomach","bodyRegion":"Core","type":"Mobility","favorite":"Favorite","primaryMuscle":"Core/Back","routines":["M14"],"video":"https://www.instagram.com/p/DDeBpF2Rs7H/","workOn":"No","muscleTags":["Core","Upper/Mid Back"]},{"id":"ex-217","name":"Straddle Good Mornings","completions":0,"reps":"6 reps 10 sec hold","bodyPosition":"Sitting","bodyRegion":"Hamstrings","type":"Mobility","favorite":"","primaryMuscle":"Hamstrings/Lower Back","routines":[],"video":"https://www.instagram.com/p/DDEcBiXSbLf/","workOn":"","muscleTags":["Hamstrings","Lower Back"]},{"id":"ex-218","name":"Crouching Crab","completions":5,"reps":"7 reps each side","bodyPosition":"Standing","bodyRegion":"Quads","type":"Mobility","favorite":"No","primaryMuscle":"Quads/Adductors/Hips","routines":["M12"],"video":"https://www.instagram.com/p/DJ146yPp3dg/","workOn":"Work On","muscleTags":["Adductors","Hips","Quads"]},{"id":"ex-219","name":"Single Leg Bench Squats","completions":4,"reps":"6 reps each side","bodyPosition":"Standing","bodyRegion":"Quads","type":"Mobility","favorite":"No","primaryMuscle":"Quads/Knees","routines":["M11"],"video":"https://www.instagram.com/p/DJ146yPp3dg/","workOn":"No","muscleTags":["Knees","Quads"]},{"id":"ex-220","name":"Knee Push-Outs","completions":4,"reps":"8 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Hips","routines":["M13"],"video":"https://www.instagram.com/p/DIZsxjTTO1U/","workOn":"No","muscleTags":["Hips"]},{"id":"ex-221","name":"Sissy Squat Pulses","completions":4,"reps":"10 reps","bodyPosition":"Kneeling","bodyRegion":"Knees","type":"Mobility","favorite":"Favorite","primaryMuscle":"Knees/Ankles/Quads","routines":["M14"],"video":"https://www.instagram.com/p/DIZsxjTTO1U/","workOn":"Work On","muscleTags":["Ankles","Knees","Quads"]},{"id":"ex-222","name":"Deep Squat Spinal Wave","completions":3,"reps":"8 reps","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Spine/Hips","routines":["M15"],"video":"https://www.instagram.com/p/DIZsxjTTO1U/","workOn":"No","muscleTags":["Hips","Upper/Mid Back"]},{"id":"ex-223","name":"Bow Pose","completions":3,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Spine/Shoulders","routines":["S12"],"video":"https://www.instagram.com/p/DKCiJcpSS3g/","workOn":"Work On","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-224","name":"Bridge Pose Shoulder Opener","completions":3,"reps":"","bodyPosition":"On Back","bodyRegion":"Shoulders","type":"Stretching","favorite":"Favorite","primaryMuscle":"Shoulders","routines":["S11"],"video":"https://www.instagram.com/p/DFzcJvBChW1/","workOn":"Work On","muscleTags":["Shoulders"]},{"id":"ex-225","name":"Wide Leg Fold w/ Interlaced Hands","completions":3,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"No","primaryMuscle":"Back/Hamstrings/Shoulders/Chest","routines":["S11"],"video":"https://www.instagram.com/p/DFzcJvBChW1/","workOn":"No","muscleTags":["Chest","Hamstrings","Shoulders","Upper/Mid Back"]},{"id":"ex-226","name":"Figure 4 Bridge + Rotation","completions":4,"reps":"6 reps each side","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"No","primaryMuscle":"Hips/Shoulders/Glutes","routines":["M13"],"video":"https://www.instagram.com/p/DHIx_bQO4AB/","workOn":"No","muscleTags":["Glutes","Hips","Shoulders"]},{"id":"ex-227","name":"Two Legged Hip Internal Rotation","completions":0,"reps":"6 reps each side","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips","routines":[],"video":"https://www.instagram.com/p/DHIx_bQO4AB/","workOn":"","muscleTags":["Hips"]},{"id":"ex-228","name":"Seated Shoulder to Knee Taps","completions":4,"reps":"8 reps each side","bodyPosition":"Sitting","bodyRegion":"Upper/Mid Back","type":"Mobility","favorite":"No","primaryMuscle":"Back","routines":["M11"],"video":"https://www.instagram.com/p/DO4BC_gkYhO/","workOn":"No","muscleTags":["Upper/Mid Back"]},{"id":"ex-229","name":"Supine Figure 4","completions":4,"reps":"","bodyPosition":"On Back","bodyRegion":"Quads","type":"Stretching","favorite":"No","primaryMuscle":"Quads/Lower Back","routines":["S12","S14"],"video":"https://www.instagram.com/p/DO4BC_gkYhO/","workOn":"No","muscleTags":["Lower Back","Quads"]},{"id":"ex-230","name":"Figure 4 Twist","completions":4,"reps":"","bodyPosition":"On Back","bodyRegion":"Lower Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Lower Back/Shoulders","routines":["S12","S13"],"video":"https://www.instagram.com/p/DRpXEZFkRKY/","workOn":"No","muscleTags":["Lower Back","Shoulders"]},{"id":"ex-231","name":"Thread the Needle - Knee Up","completions":3,"reps":"","bodyPosition":"On Stomach","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"Favorite","primaryMuscle":"Back/Shoulders","routines":["S12"],"video":"https://www.instagram.com/p/DRpXEZFkRKY/","workOn":"No","muscleTags":["Shoulders","Upper/Mid Back"]},{"id":"ex-232","name":"Doorframe Twist Back Stretch","completions":1,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"","primaryMuscle":"Mid Back","routines":["S14"],"video":"https://www.instagram.com/p/DRpXEZFkRKY/","workOn":"","muscleTags":["Upper/Mid Back"]},{"id":"ex-233","name":"Doorframe Elbow Press","completions":0,"reps":"","bodyPosition":"Standing","bodyRegion":"Upper/Mid Back","type":"Stretching","favorite":"","primaryMuscle":"Upper Back","routines":[],"video":"https://www.instagram.com/p/DRpXEZFkRKY/","workOn":"","muscleTags":["Upper/Mid Back"]},{"id":"ex-234","name":"Hip Airplane","completions":0,"reps":"5 reps each side","bodyPosition":"Standing","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips/Groin","routines":[],"video":"https://www.instagram.com/p/DNMhecIgpcX/","workOn":"","muscleTags":["Adductors","Hips"]},{"id":"ex-235","name":"90/90 Internal Rotation Lift-Off + Knee Lift","completions":0,"reps":"15 reps","bodyPosition":"Sitting","bodyRegion":"Hips","type":"Mobility","favorite":"","primaryMuscle":"Hips","routines":[],"video":"https://www.instagram.com/p/DOqo0YwDTb7/","workOn":"","muscleTags":["Hips"]},{"id":"ex-236","name":"Supine Elevated Yoga Block Leg Rotations","completions":4,"reps":"12 reps","bodyPosition":"On Back","bodyRegion":"Hips","type":"Mobility","favorite":"Favorite","primaryMuscle":"Lower Back/Hips","routines":["M14"],"video":"https://www.instagram.com/p/DSaeWX2jMPf/","workOn":"Work On","muscleTags":["Hips","Lower Back"]}]

const ROUTINES_BASE = [{"id":"r-M1","name":"M1","type":"Mobility","exerciseIds":["ex-11","ex-15","ex-39","ex-48","ex-51","ex-61","ex-67","ex-111","ex-112","ex-116"]},{"id":"r-M10","name":"M10","type":"Mobility","exerciseIds":["ex-4","ex-110","ex-122","ex-137","ex-138","ex-141","ex-152","ex-154","ex-165","ex-168"]},{"id":"r-M11","name":"M11","type":"Mobility","exerciseIds":["ex-124","ex-189","ex-191","ex-194","ex-197","ex-200","ex-211","ex-214","ex-219","ex-228"]},{"id":"r-M12","name":"M12","type":"Mobility","exerciseIds":["ex-162","ex-170","ex-177","ex-182","ex-187","ex-192","ex-204","ex-213","ex-215","ex-218"]},{"id":"r-M13","name":"M13","type":"Mobility","exerciseIds":["ex-8","ex-54","ex-179","ex-180","ex-181","ex-183","ex-205","ex-212","ex-220","ex-226"]},{"id":"r-M14","name":"M14","type":"Mobility","exerciseIds":["ex-133","ex-153","ex-176","ex-182","ex-184","ex-193","ex-208","ex-216","ex-221","ex-236"]},{"id":"r-M15","name":"M15","type":"Mobility","exerciseIds":["ex-140","ex-153","ex-167","ex-169","ex-183","ex-185","ex-197","ex-211","ex-215","ex-222"]},{"id":"r-M16","name":"M16","type":"Mobility","exerciseIds":["ex-8","ex-71","ex-120","ex-122","ex-158","ex-168","ex-178","ex-188","ex-207","ex-212"]},{"id":"r-M2","name":"M2","type":"Mobility","exerciseIds":["ex-22","ex-40","ex-52","ex-64","ex-65","ex-80","ex-101","ex-109","ex-117","ex-125"]},{"id":"r-M3","name":"M3","type":"Mobility","exerciseIds":["ex-16","ex-31","ex-38","ex-53","ex-62","ex-85","ex-87","ex-100","ex-121","ex-123"]},{"id":"r-M4","name":"M4","type":"Mobility","exerciseIds":["ex-6","ex-13","ex-23","ex-26","ex-30","ex-32","ex-45","ex-55","ex-56","ex-96"]},{"id":"r-M5","name":"M5","type":"Mobility","exerciseIds":["ex-71","ex-74","ex-79","ex-89","ex-95","ex-97","ex-98","ex-102","ex-114","ex-120"]},{"id":"r-M6","name":"M6","type":"Mobility","exerciseIds":["ex-2","ex-12","ex-14","ex-17","ex-19","ex-28","ex-36","ex-41","ex-60","ex-128"]},{"id":"r-M7","name":"M7","type":"Mobility","exerciseIds":["ex-13","ex-22","ex-61","ex-64","ex-67","ex-101","ex-109","ex-111","ex-114","ex-123"]},{"id":"r-M8","name":"M8","type":"Mobility","exerciseIds":["ex-11","ex-26","ex-28","ex-31","ex-38","ex-45","ex-48","ex-85","ex-89","ex-128"]},{"id":"r-M9","name":"M9","type":"Mobility","exerciseIds":["ex-82","ex-115","ex-147","ex-148","ex-151","ex-155","ex-166","ex-167","ex-171","ex-172"]},{"id":"r-S1","name":"S1","type":"Stretching","exerciseIds":["ex-9","ex-25","ex-33","ex-34","ex-43","ex-44","ex-69","ex-83","ex-90","ex-127"]},{"id":"r-S10","name":"S10","type":"Stretching","exerciseIds":["ex-7","ex-25","ex-77","ex-84","ex-108","ex-118","ex-132","ex-134","ex-146","ex-173"]},{"id":"r-S11","name":"S11","type":"Stretching","exerciseIds":["ex-104","ex-130","ex-131","ex-195","ex-201","ex-202","ex-203","ex-210","ex-224","ex-225"]},{"id":"r-S12","name":"S12","type":"Stretching","exerciseIds":["ex-20","ex-21","ex-73","ex-77","ex-107","ex-119","ex-223","ex-229","ex-230","ex-231"]},{"id":"r-S13","name":"S13","type":"Stretching","exerciseIds":["ex-33","ex-34","ex-72","ex-76","ex-88","ex-92","ex-93","ex-136","ex-210","ex-230"]},{"id":"r-S14","name":"S14","type":"Stretching","exerciseIds":["ex-1","ex-18","ex-35","ex-90","ex-94","ex-144","ex-173","ex-201","ex-229","ex-232"]},{"id":"r-S2","name":"S2","type":"Stretching","exerciseIds":["ex-3","ex-20","ex-37","ex-47","ex-73","ex-91","ex-104","ex-106","ex-131"]},{"id":"r-S3","name":"S3","type":"Stretching","exerciseIds":["ex-7","ex-18","ex-50","ex-57","ex-63","ex-70","ex-93","ex-94","ex-99","ex-113"]},{"id":"r-S4","name":"S4","type":"Stretching","exerciseIds":["ex-24","ex-27","ex-49","ex-68","ex-76","ex-88","ex-107","ex-108","ex-119","ex-129"]},{"id":"r-S5","name":"S5","type":"Stretching","exerciseIds":["ex-5","ex-29","ex-42","ex-66","ex-75","ex-81","ex-84","ex-92","ex-118","ex-126"]},{"id":"r-S6","name":"S6","type":"Stretching","exerciseIds":["ex-1","ex-21","ex-46","ex-58","ex-59","ex-72","ex-78","ex-86","ex-103","ex-105"]},{"id":"r-S7","name":"S7","type":"Stretching","exerciseIds":["ex-5","ex-9","ex-29","ex-59","ex-63","ex-69","ex-78","ex-81","ex-99","ex-105"]},{"id":"r-S8","name":"S8","type":"Stretching","exerciseIds":["ex-1","ex-3","ex-24","ex-47","ex-49","ex-58","ex-70","ex-103","ex-113","ex-126"]},{"id":"r-S9","name":"S9","type":"Stretching","exerciseIds":["ex-10","ex-35","ex-37","ex-57","ex-75","ex-129","ex-130","ex-144","ex-145","ex-157"]}]

const MUSCLE_TAG_ZONES = [
  { zone: "Upper Body", tags: ["Neck","Shoulders","Chest","Upper/Mid Back","Lats","Biceps","Triceps","Forearms","Arms","Wrist"] },
  { zone: "Core",       tags: ["Core","Abs","Obliques","Lower Back","Spine","Hips","Hip Flexors","Glutes"] },
  { zone: "Legs",       tags: ["Adductors","Abductors","Groin","Quads","Hamstrings","Knees","Calves","Tibialis","Achilles","Ankles","Feet"] },
];
const ALL_MUSCLE_TAGS = MUSCLE_TAG_ZONES.flatMap(z => z.tags);

// Map primaryMuscle text parts to canonical tags — preserves granularity
function deriveMuscleTags(primaryMuscle, bodyRegion) {
  if (!primaryMuscle) return bodyRegion ? [bodyRegion] : [];
  const MUSCLE_MAP = {
    // Neck
    "neck":"Neck",
    // Upper body — granular
    "shoulders":"Shoulders","shoulder":"Shoulders","rotator cuff":"Shoulders","rotator":"Shoulders",
    "chest":"Chest","pec":"Chest","pecs":"Chest","pectorals":"Chest",
    "upper/mid back":"Upper/Mid Back","upper back":"Upper/Mid Back","mid back":"Upper/Mid Back",
    "back":"Upper/Mid Back",
    "lats":"Lats","lat":"Lats",
    "biceps":"Biceps","bicep":"Biceps",
    "triceps":"Triceps","tricep":"Triceps",
    "forearms":"Forearms","forearm":"Forearms",
    "wrist":"Wrist","wrists":"Wrist",
    "arms":"Arms",
    // Core & back — granular
    "core":"Core",
    "abs":"Abs","abdominals":"Abs","abdominal":"Abs",
    "obliques":"Obliques","oblique":"Obliques",
    "lower back":"Lower Back","lumbar":"Lower Back",
    "spine":"Spine","spinal":"Spine",
    // Hips & glutes — granular
    "hips":"Hips","hip":"Hips",
    "hip flexors":"Hip Flexors","hip flexor":"Hip Flexors",
    "glutes":"Glutes","glute":"Glutes",
    "abductors":"Abductors","abductor":"Abductors",
    "adductors":"Adductors","adductor":"Adductors",
    "groin":"Groin",
    // Legs — granular
    "quads":"Quads","quad":"Quads","quadriceps":"Quads",
    "hamstrings":"Hamstrings","hamstring":"Hamstrings",
    "knees":"Knees","knee":"Knees",
    "calves":"Calves","calf":"Calves",
    "tibialis":"Tibialis",
    "achilles":"Achilles",
    "ankles":"Ankles","ankle":"Ankles",
    "feet":"Feet","foot":"Feet",
    // Misc fallbacks
    "legs":"Quads",
  };
  const parts = primaryMuscle.split(/[/,&+]/).map(s => s.trim()).filter(Boolean);
  const seen = new Set();
  const tags = [];
  parts.forEach(p => {
    const key = p.toLowerCase();
    const mapped = MUSCLE_MAP[key];
    if (mapped) {
      if (!seen.has(mapped)) { seen.add(mapped); tags.push(mapped); }
    } else if (bodyRegion && !seen.has(bodyRegion)) {
      const skip = ["joint","muscle","tendon","tissue",""];
      if (!skip.includes(key)) { seen.add(bodyRegion); tags.push(bodyRegion); }
    }
  });
  if (tags.length === 0 && bodyRegion) tags.push(bodyRegion);
  return tags;
}

// Recompute muscleTags from primaryMuscle
function syncMuscleTags(ex) {
  return { ...ex, muscleTags: deriveMuscleTags(ex.primaryMuscle, ex.bodyRegion) };
}

const S_COLOR = "#2196C4";   // Stretching — medium blue (dark mode friendly)
const M_COLOR = "#E97132";   // Mobility — orange

const REGION_COLORS = {
  // Upper body = amber/yellow
  "Neck":"#D4A838",
  "Shoulders":"#D4A838","Chest":"#D4A838","Upper/Mid Back":"#D4A838","Lats":"#D4A838","Back":"#D4A838",
  "Biceps":"#D4A838","Triceps":"#D4A838","Forearms":"#D4A838","Wrist":"#D4A838","Arms":"#D4A838",
  // Core & back = blue
  "Core":"#4FA8D4","Abs":"#4FA8D4","Obliques":"#4FA8D4","Lower Back":"#4FA8D4","Spine":"#4FA8D4",
  // Hips & glutes = blue (same zone)
  "Hips":"#4FA8D4","Hip Flexors":"#4FA8D4","Glutes":"#4FA8D4","Abductors":"#4FA8D4",
  // Legs = green
  "Adductors":"#52A882","Groin":"#52A882",
  "Quads":"#52A882","Hamstrings":"#52A882","Knees":"#52A882",
  "Calves":"#52A882","Tibialis":"#52A882","Achilles":"#52A882","Ankles":"#52A882","Feet":"#52A882"
};

const POSITION_ORDER = ["Standing","Kneeling","Sitting","On Back","On Stomach"];

function sortRoutines(routines) {
  return [...routines].sort((a,b) => {
    const p = n => { const m = n.match(/^([MS])(\d+)$/); return m ? [m[1], parseInt(m[2])] : [n,0]; };
    const [at,an] = p(a.name); const [bt,bn] = p(b.name);
    return at !== bt ? at.localeCompare(bt) : an - bn;
  });
}

const fmtDate = iso => {
  if (!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+m-1]} ${+d}, ${y}`;
};



function MuscleTagPicker({ value, onChange }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const allKnownTags = new Set(ALL_MUSCLE_TAGS);
  const orphanSelected = value.filter(t => !allKnownTags.has(t));
  const filteredZones = q
    ? [{ zone: "Results", tags: [...new Set([...ALL_MUSCLE_TAGS, ...orphanSelected])].filter(t => t.toLowerCase().includes(q)) }]
    : [...(orphanSelected.length > 0 ? [{ zone: "Other (legacy)", tags: orphanSelected }] : []), ...MUSCLE_TAG_ZONES];

  return (
    <div style={{border:"0.5px solid "+DARK.border,borderRadius:8,overflow:"hidden",background:DARK.bg}}>
      {/* Selected tag pills */}
      {value.length > 0 && (
        <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"8px 10px 6px",borderBottom:"0.5px solid "+DARK.border2}}>
          {value.map(t => {
            const c = REGION_COLORS[t]||"#888";
            return (
              <span key={t} onClick={() => onChange(value.filter(x=>x!==t))}
                style={{fontSize:11,padding:"2px 8px",borderRadius:20,background:c+"22",color:c,border:`0.5px solid ${c}55`,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}}>
                {t}
                <span style={{fontSize:9,opacity:0.7,lineHeight:1}}>&#10005;</span>
              </span>
            );
          })}
        </div>
      )}

      {/* Search input */}
      <div style={{padding:"6px 10px",borderBottom:"0.5px solid "+DARK.border2}}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type to search muscles/joints..."
          style={{width:"100%",boxSizing:"border-box",border:"none",outline:"none",background:"transparent",fontSize:12,color:DARK.text}}
        />
      </div>

      {/* Tag groups — fixed height scrollable */}
      <div style={{maxHeight:220,overflowY:"auto",padding:"6px 10px 8px"}}>
        {filteredZones.map(({zone, tags}) => {
          if (tags.length === 0) return null;
          return (
            <div key={zone} style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,color:DARK.text3,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:5}}>{zone}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {tags.map(t => {
                  const sel = value.includes(t);
                  const c = REGION_COLORS[t]||"#888";
                  return (
                    <span key={t}
                      onClick={() => onChange(sel ? value.filter(x=>x!==t) : [...value, t])}
                      style={{
                        fontSize:12,padding:"4px 10px",borderRadius:20,cursor:"pointer",
                        background: sel ? c : DARK.bg2,
                        color: sel ? "white" : DARK.text2,
                        border: sel ? `1px solid ${c}` : "0.5px solid "+DARK.border2,
                        fontWeight: sel ? 600 : 400,
                        transition:"all 0.1s",
                        userSelect:"none",
                      }}>
                      {t}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
        {q && filteredZones[0]?.tags.length === 0 && (
          <div style={{fontSize:12,color:DARK.text3,padding:"8px 0"}}>No matches for &ldquo;{query}&rdquo;</div>
        )}
      </div>
    </div>
  );
}


function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,padding:16}}>
      <div style={{background:"#2a2a2a",borderRadius:12,padding:24,maxWidth:320,width:"100%",border:"1px solid #555",textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,0.45)"}}>
        <p style={{fontSize:14,fontWeight:600,margin:"0 0 20px",lineHeight:1.5,color:DARK.text}}>{message}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,background:"none",border:"0.5px solid "+DARK.border2,color:DARK.text2,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,fontWeight:600,background:"#C00000",color:"white",border:"none",cursor:"pointer"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function Tag({ label, color }) {
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:500,background:color+"22",color,border:`1px solid ${color}44`,flexShrink:0}}>{label}</span>;
}

// ── WorkoutView ───────────────────────────────────────────────
function WorkoutView({ routine, exercises, onComplete, onExit, onUpdateExercise, onSaveRoutine, onSwapExercise, exerciseCompletionCounts, exerciseLastCompleted }) {
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [swapSeq, setSwapSeq] = useState({}); // slotIdx → ordered array of shown exercise IDs
  const startEdit = ex => { setEditId(ex.id); setEditFields({name:ex.name||"",reps:ex.type==="Stretching"?(ex.reps||"N/A"):ex.reps||"",video:ex.video||"",muscleTags:[...(ex.muscleTags||[])],bodyPosition:ex.bodyPosition||"",type:ex.type||"Stretching",favorite:ex.favorite||"No",workOn:ex.workOn||"No"}); };
  const saveEdit = ex => {
    onUpdateExercise(ex.id, editFields);
    setEditId(null);
  };

  const doSwapInWorkout = (ex, idx) => {
    // seq = ordered list of exercise IDs shown at this slot (oldest first)
    const seq = swapSeq[idx] || [];
    const fullSeq = seq.length === 0 ? [ex.id] : seq;

    const otherIds = new Set(exercises.filter((_,i2)=>i2!==idx).map(e=>e.id));
    const shownIds = new Set(fullSeq);
    const currentNeverDone = (exerciseCompletionCounts[ex.id]||0) === 0;
    const score = e => { const r=exerciseCompletionCounts[e.id]||0; return (e.favorite==="Favorite"||e.workOn==="Work On")?r*0.667:r; };

    // Pool: exercises of same type, not yet shown at this slot, not in other slots
    let pool = EXERCISES.filter(e => e.type===routine.type && !shownIds.has(e.id) && !otherIds.has(e.id));

    // Broadening pass: if same-muscle pool empty, use any not-shown, not-other
    // Cycling: if fully exhausted, wrap back through the slot sequence
    if (pool.length === 0 && fullSeq.length >= 2) {
      const cycleId = fullSeq[(fullSeq.lastIndexOf(ex.id) - 1 + fullSeq.length) % fullSeq.length];
      const cycleEx = EXERCISES.find(e => e.id === cycleId);
      if (cycleEx) { onSwapExercise(idx, cycleEx); return; }
    }
    if (pool.length === 0) return;

    // Prefer same muscle/region, fall back to full pool
    const sameGroup = pool.filter(e =>
      e.bodyRegion===ex.bodyRegion || (e.muscleTags||[]).some(t=>(ex.muscleTags||[]).includes(t))
    );
    const candidates = sameGroup.length > 0 ? sameGroup : pool;
    const never = candidates.filter(e=>(exerciseCompletionCounts[e.id]||0)===0);
    const done = candidates.filter(e=>(exerciseCompletionCounts[e.id]||0)>0).sort((a,b)=>score(a)-score(b));
    const newEx = (currentNeverDone && never.length>0) ? never[0] : done.length>0 ? done[0] : never[0]||candidates[0];

    if (!newEx) return;
    setSwapSeq(prev => ({...prev, [idx]: [...fullSeq, newEx.id]}));
    onSwapExercise(idx, newEx);
  };
  return (
    <div style={{maxWidth:520,margin:"0 auto",padding:"0 16px 32px",background:DARK.bg,minHeight:"100vh"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:DARK.bg3,zIndex:10,padding:"12px 16px",borderBottom:"1px solid "+DARK.border,marginBottom:16,borderRadius:"0 0 10px 10px",margin:"0 -16px 16px -16px"}}>
        <button onClick={onExit} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:13,padding:0}}>&#8592; Back</button>
        <span style={{fontSize:14,fontWeight:600,color:'#ffffff'}}>{routine.name}</span>
        <span style={{fontSize:12,color:DARK.text2}}>{exercises.length} exercises</span>
      </div>
      <div style={{display:"grid",gap:8}}>
        {exercises.map((ex,i) => {
          const color = REGION_COLORS[ex.bodyRegion]||"#888";
          const isEditing = editId === ex.id;
          const allTags = [...new Set(ex.muscleTags||[ex.bodyRegion])].filter(Boolean);
          return (
            <div key={ex.id} style={{borderRadius:10,border:"0.5px solid "+DARK.border2,background:DARK.bg,overflow:"hidden"}}>
                           <div style={{padding:"11px 13px"}}>
                {/* Line 1: number · name · icons · stats · video · edit — all on one row */}
                <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"nowrap",overflow:"hidden"}}>
                  <span style={{fontSize:12,color:DARK.text3,fontWeight:500,flexShrink:0,minWidth:10,textAlign:"right"}}>{i+1}</span>
                  <span style={{fontSize:14,fontWeight:600,color:DARK.text,flex:1,minWidth:0,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingLeft:3}}>{ex.name}</span>
                  {ex.favorite==="Favorite"&&<span style={{fontSize:13,color:"#E8B84B",flexShrink:0}}>&#9733;</span>}
                  {ex.workOn==="Work On"&&<span style={{fontSize:11,color:"#e06666",flexShrink:0}}>&#128170;</span>}
                  {(exerciseCompletionCounts[ex.id]||0)===0
                    ? <span style={{fontSize:10,color:"#ff6666",fontWeight:600,flexShrink:0}}>Never Completed</span>
                    : <>{exerciseLastCompleted?.[ex.id]&&<span style={{fontSize:10,color:DARK.text3,flexShrink:0}}>{Math.floor((new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T00:00:00")-new Date(exerciseLastCompleted[ex.id]+"T00:00:00"))/86400000)}d</span>}<span style={{fontSize:10,color:DARK.text3,flexShrink:0}}>{exerciseCompletionCounts[ex.id]}&#215;</span></>}
                  {ex.video&&<a href={ex.video} target="_blank" rel="noreferrer" style={{fontSize:13,color:DARK.text2,textDecoration:"none",flexShrink:0}}>&#9654;</a>}
                  <button onClick={()=>isEditing?setEditId(null):startEdit(ex)} style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:"none",border:"0.5px solid "+DARK.border,color:DARK.text2,cursor:"pointer",flexShrink:0}}>{isEditing?"Cancel":"Edit"}</button>
                </div>
                {/* Middle line: reps for Mobility only */}
                {!isEditing&&ex.type!=="Stretching"&&ex.reps&&ex.reps!=="N/A"&&<div style={{fontSize:12,color:DARK.text2,marginTop:3,paddingLeft:18}}>{ex.reps}</div>}
                {/* Line 2: indented to align with name, tags left, swap right */}
                {!isEditing&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4,gap:4,paddingLeft:18}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center",flex:1,minWidth:0}}>
                    {allTags.map(t=>{const tc=REGION_COLORS[t]||"#888";return <span key={t} style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:tc+"20",color:tc,border:`0.5px solid ${tc}44`}}>{t}</span>;})}
                    {ex.bodyPosition&&<span style={{fontSize:10,color:DARK.text3,marginLeft:2}}>{ex.bodyPosition}</span>}
                  </div>
                  {onSwapExercise&&<button onClick={()=>doSwapInWorkout(ex,i)} style={{fontSize:10,padding:"2px 7px",borderRadius:5,background:"none",border:`0.5px solid ${S_COLOR}55`,color:S_COLOR,cursor:"pointer",flexShrink:0}}>Swap</button>}
                </div>}
              </div>
              {isEditing && (
                <div style={{padding:"10px 13px 13px",borderTop:"0.5px solid "+DARK.border2,background:DARK.bg2,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {/* Exercise name */}
                  <div style={{gridColumn:"1/-1",marginBottom:4}}>
                    <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Exercise Name</div>
                    <input value={editFields.name||""} onChange={ev=>setEditFields(p=>({...p,name:ev.target.value}))} style={{width:"100%",boxSizing:"border-box",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}/>
                  </div>
                  {/* Fav + Work On */}
                  <div style={{gridColumn:"1/-1",display:"flex",gap:8,marginBottom:4}}>
                    <button onClick={()=>setEditFields(p=>({...p,favorite:p.favorite==="Favorite"?"No":"Favorite"}))} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"6px 10px",borderRadius:8,border:"0.5px solid "+(editFields.favorite==="Favorite"?"#E8B84B66":DARK.border),background:editFields.favorite==="Favorite"?"#E8B84B22":DARK.bg3,cursor:"pointer"}}>
                      <span style={{fontSize:18,color:"#E8B84B"}}>&#9733;</span>
                      <span style={{fontSize:12,color:editFields.favorite==="Favorite"?"#C49A00":DARK.text2,fontWeight:editFields.favorite==="Favorite"?600:400}}>Favorite</span>
                    </button>
                    <button onClick={()=>setEditFields(p=>({...p,workOn:p.workOn==="Work On"?"No":"Work On"}))} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"6px 10px",borderRadius:8,border:"0.5px solid "+(editFields.workOn==="Work On"?"#E8B84B66":DARK.border),background:editFields.workOn==="Work On"?"#E8B84B22":DARK.bg3,cursor:"pointer"}}>
                      <span style={{fontSize:12,color:"#e06666"}}>&#128170;</span>
                      <span style={{fontSize:12,color:editFields.workOn==="Work On"?"#E8B84B":DARK.text2,fontWeight:editFields.workOn==="Work On"?600:400}}>Work On</span>
                    </button>
                  </div>
                  <div style={{gridColumn:"1/-1",marginBottom:4}}>
                    <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Type</div>
                    <select value={editFields.type||"Stretching"} onChange={ev=>setEditFields(p=>({...p,type:ev.target.value}))} style={{width:"100%",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}>
                      <option style={{background:DARK.bg3}}>Stretching</option><option style={{background:DARK.bg3}}>Mobility</option>
                    </select>
                  </div>
                  {[["reps","Reps / Duration"],["bodyPosition","Body Position"],["video","Video URL"]].map(([field,label]) => (
                    <div key={field} style={{gridColumn:field==="video"?"1/-1":"auto"}}>
                      <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>{label}</div>
                      {field==="bodyPosition"
                        ? <select value={editFields[field]||""} onChange={ev=>setEditFields(p=>({...p,[field]:ev.target.value}))} style={{width:"100%",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}>
                            <option value="">-- select --</option>
                            {["Standing","Kneeling","Sitting","On Back","On Stomach"].map(p=><option key={p} value={p} style={{background:DARK.bg3,color:DARK.text}}>{p}</option>)}
                          </select>
                        : <input value={editFields[field]||""} onChange={e => setEditFields(p=>({...p,[field]:e.target.value}))} style={{width:"100%",boxSizing:"border-box",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}/>}
                    </div>
                  ))}
                  <div style={{gridColumn:"1/-1"}}>
                    <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Muscles / Joints</div>
                    <MuscleTagPicker value={editFields.muscleTags||[]} onChange={tags=>setEditFields(p=>({...p,muscleTags:tags}))}/>
                  </div>

                  <button onClick={() => saveEdit(ex)} style={{gridColumn:"1/-1",padding:"7px",borderRadius:6,fontSize:13,fontWeight:600,background:"#E8B84B",color:"#1a1a00",border:"none",cursor:"pointer",marginTop:2}}>Save Changes</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={onComplete} style={{width:"100%",marginTop:20,padding:"14px",borderRadius:10,fontSize:15,fontWeight:600,background:M_COLOR,color:"white",border:"none",cursor:"pointer"}}>Log as Complete</button>
      {onSaveRoutine && <button onClick={onSaveRoutine} style={{width:"100%",marginTop:10,padding:"13px",borderRadius:10,fontSize:14,fontWeight:600,background:"none",color:DARK.text2,border:"1px solid "+DARK.border,cursor:"pointer"}}>Save Routine</button>}
    </div>
  );
}

// ── AddCompletionForm ─────────────────────────────────────────
function AddCompletionForm({ allRoutines, onAdd, onClose }) {
  const [addDate, setAddDate] = useState(new Date().toISOString().split("T")[0]);
  const [addRoutineId, setAddRoutineId] = useState("");
  const doAdd = () => {
    if (!addRoutineId || !addDate) return;
    const r = allRoutines.find(r => r.id === addRoutineId);
    if (!r) return;
    onAdd({id:`manual-${Date.now()}`,routineId:r.id,routineName:r.name,date:addDate});
  };
  return (
    <div style={{background:DARK.bg3,borderRadius:8,border:"0.5px solid "+DARK.border,padding:14,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <span style={{fontSize:13,fontWeight:600}}>Add Completion</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18}}>&#10005;</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Date</div>
          <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} style={{width:"100%",boxSizing:"border-box"}}/>
        </div>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Routine</div>
          <select value={addRoutineId} onChange={e => setAddRoutineId(e.target.value)} style={{width:"100%"}}>
            <option value="">Select...</option>
            {sortRoutines(allRoutines).map(r => <option key={r.id} value={r.id}>{r.name} ({r.type})</option>)}
          </select>
        </div>
      </div>
      <button onClick={doAdd} disabled={!addRoutineId||!addDate} style={{width:"100%",padding:"8px",borderRadius:6,fontSize:13,fontWeight:600,background:M_COLOR,color:"white",border:"none",cursor:"pointer",opacity:(!addRoutineId||!addDate)?0.5:1}}>Add</button>
    </div>
  );
}

// ── ExerciseInlineEdit ────────────────────────────────────────
function ExerciseInlineEdit({ e, onUpdate, onDelete, liveCount, lastDate }) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({});
  const start = () => { setEditing(true); setFields({name:e.name||"",reps:e.type==="Stretching"?(e.reps||"N/A"):e.reps||"",video:e.video||"",muscleTags:[...(e.muscleTags||[])],bodyPosition:e.bodyPosition||"",favorite:e.favorite||"No",workOn:e.workOn||"No",type:e.type||"Stretching"}); };
  const save = () => {
    const updatedFields = {...fields};
    // muscleTags is already set directly from the picker
    onUpdate(e.id, updatedFields);
    setEditing(false);
  };
  const c = REGION_COLORS[e.bodyRegion]||"#888";
  const allTags = [...new Set(e.muscleTags||[e.bodyRegion])].filter(Boolean);
  return (
    <div style={{padding:"0 12px 12px",borderTop:`0.5px solid ${c}33`}}>
      <div style={{paddingTop:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px",fontSize:13}}>
        {allTags.length > 0 && <div style={{gridColumn:"1/-1"}}><span style={{color:DARK.text2}}>Muscles: </span>{allTags.join(", ")}</div>}
        {e.bodyPosition && !editing && <div><span style={{color:DARK.text2}}>Position: </span>{e.bodyPosition}</div>}
        {!editing && e.reps && e.type!=="Stretching" && e.reps!=="N/A" && <div style={{gridColumn:"1/-1"}}><span style={{color:DARK.text2}}>Reps: </span>{e.reps}</div>}
        <div style={{gridColumn:"1/-1",display:"flex",gap:16}}>
          {lastDate&&<span><span style={{color:DARK.text2}}>Days Since: </span>{Math.floor((new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T00:00:00")-new Date(lastDate+"T00:00:00"))/86400000)}</span>}
          {(liveCount||0)>0&&<span><span style={{color:DARK.text2}}>Completions: </span>{liveCount}</span>}
        </div>
        {e.routines && e.routines.length > 0 && <div style={{gridColumn:"1/-1"}}><span style={{color:DARK.text2}}>Routines: </span>{e.routines.join(", ")}</div>}
      </div>
      {e.video && !editing && <a href={e.video} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,color:S_COLOR,textDecoration:"none",marginTop:8}}>&#9654; Watch video</a>}
      {!editing ? (
        <div style={{display:"flex",gap:8,marginTop:10}}>
        <button onClick={start} style={{padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:500,background:"none",border:`0.5px solid ${c}`,color:c,cursor:"pointer"}}>Edit</button>
        {onDelete && <button onClick={onDelete} style={{padding:"4px 12px",borderRadius:6,fontSize:12,fontWeight:500,background:"none",border:"0.5px solid #C0000066",color:"#C00000",cursor:"pointer"}}>Delete</button>}
      </div>
      ) : (
        <div style={{marginTop:10,background:DARK.bg2,borderRadius:8,padding:10,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {/* Exercise name at top */}
          <div style={{gridColumn:"1/-1",marginBottom:4}}>
            <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Exercise Name</div>
            <input value={fields.name||""} onChange={ev=>setFields(p=>({...p,name:ev.target.value}))} style={{width:"100%",boxSizing:"border-box",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}/>
          </div>
          {/* Type selector at top */}
          <div style={{gridColumn:"1/-1",marginBottom:4}}>
            <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Type</div>
            <select value={fields.type||"Stretching"} onChange={ev=>setFields(p=>({...p,type:ev.target.value}))} style={{width:"100%",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}>
              <option style={{background:DARK.bg3}}>Stretching</option><option style={{background:DARK.bg3}}>Mobility</option>
            </select>
          </div>
          {/* Favorite + Work On symbol toggles at top */}
          <div style={{gridColumn:"1/-1",display:"flex",gap:10,marginBottom:4}}>
            <button onClick={()=>setFields(p=>({...p,favorite:p.favorite==="Favorite"?"No":"Favorite"}))} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,fontSize:14,border:"0.5px solid",borderColor:fields.favorite==="Favorite"?"#E8B84B66":DARK.border2,background:fields.favorite==="Favorite"?"#E8B84B22":DARK.bg,cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{fontSize:20,lineHeight:1,color:"#E8B84B"}}>&#9733;</span>
              <span style={{fontSize:12,color:fields.favorite==="Favorite"?"#C49A00":DARK.text2,fontWeight:fields.favorite==="Favorite"?600:400}}>Favorite</span>
            </button>
            <button onClick={()=>setFields(p=>({...p,workOn:p.workOn==="Work On"?"No":"Work On"}))} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:8,fontSize:14,border:"0.5px solid",borderColor:fields.workOn==="Work On"?"#8B000066":DARK.border2,background:fields.workOn==="Work On"?"#8B000022":DARK.bg,cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{fontSize:12,lineHeight:1,color:"#e06666"}}>&#128170;</span>
              <span style={{fontSize:12,color:fields.workOn==="Work On"?"#e06666":DARK.text2,fontWeight:fields.workOn==="Work On"?600:400}}>Work On</span>
            </button>
          </div>
          {[["reps","Reps"],["bodyPosition","Body Position"],["video","Video URL"]].map(([field,label]) => (
            <div key={field} style={{gridColumn:field==="video"?"1/-1":"auto"}}>
              <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>{label}</div>
              {field==="bodyPosition"
                ? <select value={fields[field]||""} onChange={ev=>setFields(p=>({...p,[field]:ev.target.value}))} style={{width:"100%",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}>
                    <option value="" style={{background:DARK.bg3}}>-- select --</option>
                    {["Standing","Kneeling","Sitting","On Back","On Stomach"].map(p=><option key={p} value={p} style={{background:DARK.bg3,color:DARK.text}}>{p}</option>)}
                  </select>
                : <input value={fields[field]||""} onChange={ev => setFields(p=>({...p,[field]:ev.target.value}))} style={{width:"100%",boxSizing:"border-box",fontSize:12,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"6px 8px"}}/>}
            </div>
          ))}
          <div style={{gridColumn:"1/-1"}}>
            <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Muscles / Joints</div>
            <MuscleTagPicker value={fields.muscleTags||[]} onChange={tags=>setFields(p=>({...p,muscleTags:tags}))}/>
          </div>


          <div style={{display:"flex",gap:8,gridColumn:"1/-1"}}>
            <button onClick={save} style={{flex:1,padding:"7px",borderRadius:6,fontSize:13,fontWeight:600,background:"#E8B84B",color:"#1a1a00",border:"none",cursor:"pointer"}}>Save</button>
            <button onClick={() => setEditing(false)} style={{padding:"7px 12px",borderRadius:6,fontSize:13,background:"none",border:"0.5px solid "+DARK.border2,color:DARK.text2,cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── AddExerciseForm ───────────────────────────────────────────
function AddExerciseForm({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Stretching");
  const [bodyRegion, setBodyRegion] = useState("");
  const [bodyPosition, setBodyPosition] = useState("");
  const [muscleTags, setMuscleTags] = useState([]);
  const [reps, setReps] = useState("");
  const [video, setVideo] = useState("");
  const [favorite, setFavorite] = useState("No");
  const [workOn, setWorkOn] = useState("No");
  const regionList = ["Neck","Shoulders","Arms","Wrist","Chest","Upper/Mid Back","Lower Back","Core","Hips","Glutes","Adductors","Quads","Hamstrings","Knees","Calves","Ankles","Feet"];
  const positionList = ["Standing","Kneeling","Sitting","On Back","On Stomach"];
  const save = () => {
    if (!name.trim()) return;
    onSave({id:`cex-${Date.now()}`,name:name.trim(),type,bodyRegion,bodyPosition,primaryMuscle:"",reps,video,favorite,workOn,completions:0,routines:[],muscleTags});
  };
  return (
    <div style={{background:DARK.bg3,borderRadius:10,border:"0.5px solid "+DARK.border,padding:16,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontWeight:600,fontSize:15}}>Add Exercise</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18}}>&#10005;</button>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Name *</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Exercise name" style={{width:"100%",boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Type</div>
          <select value={type} onChange={e => setType(e.target.value)} style={{width:"100%"}}><option>Stretching</option><option>Mobility</option></select>
        </div>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Body Region</div>
          <select value={bodyRegion} onChange={e => setBodyRegion(e.target.value)} style={{width:"100%"}}>
            <option value="">-- select --</option>
            {regionList.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Body Position</div>
          <select value={bodyPosition} onChange={e => setBodyPosition(e.target.value)} style={{width:"100%"}}>
            <option value="">-- select --</option>
            {positionList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Reps / Duration</div>
          <input value={reps} onChange={e => setReps(e.target.value)} placeholder="e.g. 5 reps each side" style={{width:"100%",boxSizing:"border-box"}}/>
        </div>
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Muscles / Joints</div>
        <MuscleTagPicker value={muscleTags} onChange={setMuscleTags}/>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:DARK.text2,marginBottom:4}}>Video URL</div>
        <input value={video} onChange={e => setVideo(e.target.value)} placeholder="YouTube or Instagram URL" style={{width:"100%",boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:14}}>
        <button onClick={()=>setFavorite(v=>v==="Favorite"?"No":"Favorite")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"0.5px solid",borderColor:favorite==="Favorite"?"#E8B84B66":DARK.border2,background:favorite==="Favorite"?"#E8B84B22":DARK.bg,cursor:"pointer"}}>
          <span style={{fontSize:20,color:"#E8B84B"}}>&#9733;</span>
          <span style={{fontSize:13,color:favorite==="Favorite"?"#C49A00":DARK.text2,fontWeight:favorite==="Favorite"?600:400}}>Favorite</span>
        </button>
        <button onClick={()=>setWorkOn(v=>v==="Work On"?"No":"Work On")} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:8,border:"0.5px solid",borderColor:workOn==="Work On"?"#8B000066":DARK.border2,background:workOn==="Work On"?"#8B000022":DARK.bg,cursor:"pointer"}}>
          <span style={{fontSize:12,color:"#e06666"}}>&#128170;</span>
          <span style={{fontSize:13,color:workOn==="Work On"?"#e06666":DARK.text2,fontWeight:workOn==="Work On"?600:400}}>Work On</span>
        </button>
      </div>
      <button onClick={save} disabled={!name.trim()} style={{width:"100%",padding:"11px",borderRadius:8,fontSize:14,fontWeight:600,background:name.trim()?S_COLOR:DARK.bg2,color:name.trim()?"white":DARK.text3,border:"none",cursor:name.trim()?"pointer":"default"}}>Add Exercise</button>
    </div>
  );
}

// ── NewRoutineBuilder ─────────────────────────────────────────

function NewRoutineBuilder({ filterType, exerciseRoutineCount, exerciseCompletionCounts, exerciseLastCompleted, recentExercisesByType, onStart, onClose }) {
  const [step, setStep] = useState("generating");
  const [routineType] = useState(filterType||"Stretching");
  const [exercises, setExercises] = useState([]);
  const [routineName, setRoutineName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { generate(filterType||"Stretching"); }, []);

  const generate = async type => {
    setLoading(true); setError(null); setStep("generating");
    try {
      // Score exercises: blend completion count (80%) + recency (20%)
      // FAV/IMPROVE halves effective done count (2:1 boost)
      const today = new Date();
      const MAX_DONE = Math.max(1, ...EXERCISES.filter(e=>e.type===type).map(e=>exerciseCompletionCounts[e.id]||0)); // dynamic cap
      const MAX_DAYS = 90;  // recency cap in days

      // Build scored candidates
      // Compute weighted muscle contributions per exercise (tag order: 1, 0.5, 0.25, 0.125)
      const getMuscleWeights = ex => {
        const tags = ex.muscleTags || [ex.bodyRegion];
        const weights = {};
        tags.forEach((t, i) => { weights[t] = (weights[t]||0) + Math.pow(0.5, i); });
        // Normalize so total weight = 1 regardless of tag count
        const total = Object.values(weights).reduce((s,v)=>s+v, 0) || 1;
        Object.keys(weights).forEach(k => { weights[k] /= total; });
        return weights;
      };

      const allCandidates = EXERCISES.filter(e => e.type === type).map(e => {
        const rarity = exerciseRoutineCount[e.id]||0;
        const rawDone = exerciseCompletionCounts[e.id]||0;
        const normDone = Math.min(rawDone, MAX_DONE) / MAX_DONE;

        const lastDate = exerciseLastCompleted[e.id];
        const daysSince = lastDate
          ? Math.floor((today - new Date(lastDate+"T12:00:00")) / 86400000)
          : MAX_DAYS;
        const normRecency = Math.min(daysSince, MAX_DAYS) / MAX_DAYS;

        const recent = recentExercisesByType?.[type] || { last3: new Set(), last6: new Set() };
        const inLast3 = recent.last3.has(e.id);
        const inLast6 = recent.last6.has(e.id);
        const recencyPenalty = inLast3 ? 0.8 : inLast6 ? 0.35 : 0;

        // Small random jitter (±10%) for variety between regenerations
        const jitter = (Math.random() - 0.5) * 0.2;
        // Equal weight: 50% completion count, 50% recency. No rarity penalty.
        const favBoost = (e.favorite==="Favorite"||e.workOn==="Work On") ? 0.667 : 1.0;
        const score = (normDone * 0.5 + (1 - normRecency) * 0.5 + recencyPenalty + jitter) * favBoost;

        const neverDone = (exerciseCompletionCounts[e.id]||0) === 0;
        const flags = [e.favorite==="Favorite"?"FAV":"", e.workOn==="Work On"?"IMPROVE":""].filter(Boolean).join(",");
        const muscleWeights = getMuscleWeights(e);
        return { e, rarity, score, flags, neverDone, muscleWeights };
      });

      // Separate never-done exercises
      const neverDonePool = allCandidates.filter(c => c.neverDone).sort((a,b) => a.rarity - b.rarity);
      const doneBefore = allCandidates.filter(c => !c.neverDone).sort((a,b) => a.score - b.score || a.rarity - b.rarity);

      // Always inject exactly 1 never-completed exercise if available
      let forcedNever = null;
      if (neverDonePool.length > 0) {
        forcedNever = neverDonePool[0];
      }

      // Build top candidates from done-before pool (cap at 79 to leave room for 1 never-done)
      const topDone = doneBefore.slice(0, forcedNever ? 79 : 80);
      const topCandidates = forcedNever ? [...topDone, forcedNever] : topDone;
      const forcedId = forcedNever ? forcedNever.e.id : null;
      const list = topCandidates.map(({e, rarity, score, flags, neverDone, muscleWeights}) => {
        const mw = Object.entries(muscleWeights).map(([k,v])=>`${k}:${v.toFixed(2)}`).join(",");
        return `${e.id}|${e.name}|${e.bodyRegion}|${e.bodyPosition}|${score.toFixed(2)}|[${mw}]${neverDone?"|NEW":""}${flags?"|"+flags:""}`;
      }).join("\n");
      const forcedNote = forcedId ? `\nIMPORTANT: You MUST include exactly this one NEW exercise: ${forcedId}. Include no other NEW-tagged exercises.` : "";
      const resp = await fetch("/api/generate", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system:`Pick 10 ${type} exercises. Cover 6+ body regions, max 2 per region. Prefer lower score. Exercises tagged NEW have never been done — include exactly 1 NEW exercise and no more.${forcedNote} Return ONLY JSON: {"exerciseIds":["id1","id2","id3","id4","id5","id6","id7","id8","id9","id10"]}\n\n${list}`,
          userMessage:`Create ${type} routine`
        })
      });
      const data = await resp.json();
      if (data.error) throw new Error(`API error: ${data.error.message||data.error.type||JSON.stringify(data.error)}`);
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if (!text) throw new Error(`No AI response. Status: ${resp.status}. Response: ${JSON.stringify(data).slice(0,200)}`);
      const s = text.indexOf("{"), e2 = text.lastIndexOf("}");
      if (s===-1) throw new Error("No JSON in AI response: "+text.slice(0,100));
      const parsed = JSON.parse(text.slice(s,e2+1));
      if (!parsed.exerciseIds||parsed.exerciseIds.length!==10) throw new Error("Did not return 10 exercises");
      let exObjs = parsed.exerciseIds.map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean);
      // If AI returned fewer than 10 valid exercises, pad with top-scored candidates not already included
      if (exObjs.length < 10) {
        const usedIds = new Set(exObjs.map(e=>e.id));
        const backfill = topCandidates
          .map(c=>c.e)
          .filter(e=>!usedIds.has(e.id))
          .slice(0, 10 - exObjs.length);
        exObjs = [...exObjs, ...backfill];
      }
      if (exObjs.length < 1) throw new Error("No exercises returned from AI");
      // Sort by body position order
      const sorted = [...exObjs].sort((a,b)=>{
        const ai=POSITION_ORDER.indexOf(a.bodyPosition); const bi=POSITION_ORDER.indexOf(b.bodyPosition);
        return (ai===-1?99:ai)-(bi===-1?99:bi);
      });
      const label = `${type==="Stretching"?"S":"M"} (generated)`;
      const fakeRoutine = {id:`gen-${Date.now()}`,name:label,type,exerciseIds:sorted.map(e=>e.id)};
      onStart(fakeRoutine, sorted);
    } catch(err) {
      console.error("Generate error:", err);
      setError(err.message||"Generation failed. Try again.");
      setStep("generating");
    } finally { setLoading(false); }
  };

  const doSwap = (i) => {
    const slot = exercises[i];
    const current = slot.ex;
    const swappedOut = slot.swappedOut || new Set();
    const usedIds = new Set(exercises.map(item=>item.ex.id));
    const currentNeverDone = (exerciseCompletionCounts[current.id]||0) === 0;
    const score = e => { const r=exerciseCompletionCounts[e.id]||0; return (e.favorite==="Favorite"||e.workOn==="Work On")?r*0.5:r; };

    // After 5 swaps, reset soft exclusions (allow revisiting earlier swaps)
    const softExclude = swappedOut.size < 5
      ? new Set([...swappedOut, ...usedIds])
      : new Set([...usedIds]);

    const pool = EXERCISES.filter(e => e.type===routineType && !softExclude.has(e.id));
    const fallback = pool.length > 0 ? pool : EXERCISES.filter(e => e.type===routineType && !usedIds.has(e.id));

    const pickFrom = candidates => {
      const never = candidates.filter(e=>(exerciseCompletionCounts[e.id]||0)===0);
      const done = candidates.filter(e=>(exerciseCompletionCounts[e.id]||0)>0).sort((a,b)=>score(a)-score(b));
      return currentNeverDone && never.length>0 ? never[0] : done.length>0 ? done[0] : never[0]||null;
    };

    const newEx = pickFrom(fallback);
    if (!newEx) return;

    const newSwappedOut = new Set([...swappedOut, current.id]);
    setExercises(p=>{
      const updated = p.map((item,idx2)=>idx2===i ? {ex:newEx, swappedOut:newSwappedOut} : item);
      return [...updated].sort((a,b)=>{
        const ai=POSITION_ORDER.indexOf(a.ex.bodyPosition); const bi=POSITION_ORDER.indexOf(b.ex.bodyPosition);
        return (ai===-1?99:ai)-(bi===-1?99:bi);
      });
    });
  };
  const moveUp = i => { if(i===0)return; setExercises(p=>{const a=[...p];[a[i-1],a[i]]=[a[i],a[i-1]];return a;}); };
  const moveDown = i => setExercises(p=>{if(i>=p.length-1)return p;const a=[...p];[a[i],a[i+1]]=[a[i+1],a[i]];return a;});
  const startR = () => {
    const label = routineType==="Stretching"?"S (generated)":"M (generated)";
    const fakeRoutine = {id:`gen-${Date.now()}`,name:label,type:routineType,exerciseIds:exercises.map(e=>e.ex.id)};
    onStart(fakeRoutine, exercises.map(item=>item.ex));
  };

  if (step==="generating"||loading) return (
    <div style={{background:DARK.bg3,borderRadius:10,border:"0.5px solid "+DARK.border,padding:20,marginBottom:16,textAlign:"center"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontWeight:600,fontSize:15,color:DARK.text}}>Generate Routine</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18}}>&#10005;</button>
      </div>
      {error
        ? <div style={{fontSize:12,color:"#C00000",padding:"8px 10px",background:"#C0000011",borderRadius:6,textAlign:"left",marginBottom:10}}>{error}
            <button onClick={()=>generate(routineType)} style={{display:"block",marginTop:8,width:"100%",padding:"8px",borderRadius:6,fontSize:13,background:S_COLOR,color:"white",border:"none",cursor:"pointer"}}>Retry</button>
          </div>
        : <div style={{color:DARK.text2,fontSize:13}}>Building your {routineType} routine...</div>
      }
    </div>
  );

  return (
    <div style={{background:DARK.bg3,borderRadius:10,border:"0.5px solid "+DARK.border,padding:16,marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontWeight:600,fontSize:15}}>Edit Routine</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18}}>&#10005;</button>
      </div>
      <input value={routineName} onChange={e=>setRoutineName(e.target.value)} style={{width:"100%",marginBottom:14,boxSizing:"border-box",fontSize:14,fontWeight:500}} placeholder="Routine name"/>
      <div style={{display:"grid",gap:6,marginBottom:14}}>
        {exercises.map(({ex},i)=>{
          const color=REGION_COLORS[ex.bodyRegion]||"#888";
          const alts = EXERCISES.filter(e=>e.id!==ex.id&&e.type===routineType&&(e.bodyRegion===ex.bodyRegion||(e.muscleTags||[]).some(t=>(ex.muscleTags||[]).includes(t)))&&!exercises.map(item=>item.ex.id).includes(e.id)).sort((a,b)=>(exerciseRoutineCount[a.id]||0)-(exerciseRoutineCount[b.id]||0)).slice(0,5);
          return (
            <div key={ex.id}>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 11px",borderRadius:8,border:"0.5px solid "+DARK.border,background:DARK.bg2}}>
                <span style={{fontSize:11,color:DARK.text3,minWidth:16,textAlign:"center"}}>{i+1}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{fontSize:15,fontWeight:600,lineHeight:1.3,color:DARK.text}}>{ex.name}</span>
                    {ex.favorite==="Favorite"&&<span style={{fontSize:13,color:"#E8B84B"}}>&#9733;</span>}
                    {ex.workOn==="Work On"&&<span style={{fontSize:12,color:"#e06666"}}>&#128170;</span>}
                  </div>
                  <div style={{display:"flex",gap:4,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
                    {(ex.muscleTags||[ex.bodyRegion]).filter(Boolean).map(t => {
                      const tc=REGION_COLORS[t]||"#888";
                      return <span key={t} style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:tc+"20",color:tc,border:`0.5px solid ${tc}44`}}>{t}</span>;
                    })}
                    {ex.bodyPosition&&<span style={{fontSize:10,color:DARK.text3,marginLeft:2}}>{ex.bodyPosition}</span>}
                    {(exerciseCompletionCounts[ex.id]||0)===0&&<span style={{fontSize:10,color:"#C00000",fontWeight:600}}>Never Completed</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                  {exerciseLastCompleted[ex.id]&&<span style={{fontSize:10,color:DARK.text3,marginRight:1}}>{Math.floor((new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T00:00:00")-new Date(exerciseLastCompleted[ex.id]+"T00:00:00"))/86400000)}d</span>}
                  {(exerciseCompletionCounts[ex.id]||0)>0&&<span style={{fontSize:10,color:DARK.text3,marginRight:2}}>{exerciseCompletionCounts[ex.id]}&#215;</span>}
                  <button onClick={()=>doSwap(i)} style={{padding:"3px 8px",borderRadius:5,fontSize:11,background:"none",color:S_COLOR,border:`0.5px solid ${S_COLOR}66`,cursor:"pointer"}}>Swap</button>
                </div>
              </div>

            </div>
          );
        })}
      </div>
      <button onClick={startR} style={{width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontWeight:600,background:routineType==="Stretching"?S_COLOR:M_COLOR,color:"white",border:"none",cursor:"pointer"}}>Start Routine</button>
    </div>
  );
}

// ── AiRoutineModal ────────────────────────────────────────────
function AiRoutineModal({ onStart, onClose, exerciseCompletionCounts }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async () => {
    if (!prompt.trim()||loading) return;
    setLoading(true); setError(null);
    try {
      const exerciseList = EXERCISES.map(e => {
        const rawDone = exerciseCompletionCounts[e.id]||0;
        const boosted = (e.favorite==="Favorite"||e.workOn==="Work On") ? rawDone*0.5 : rawDone;
        const flags = [e.favorite==="Favorite"?"FAV":"",e.workOn==="Work On"?"IMPROVE":""].filter(Boolean).join(",");
        return `${e.id}|${e.name}|${e.type}|${e.bodyRegion}|${e.bodyPosition}|d:${Math.round(boosted)}${flags?"|"+flags:""}`;
      }).join("\n");
      const response = await fetch("/api/generate",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system:`You are a stretching and mobility coach. Select exactly 10 exercises that best address the user description. Mix types appropriately. Prioritize body regions mentioned. Favor FAV/IMPROVE exercises and lower done counts. Return ONLY JSON: {"label":"short label","exerciseIds":["id1","id2","id3","id4","id5","id6","id7","id8","id9","id10"]}\n\nExercises:\n${exerciseList}`,
          userMessage:prompt
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(`API error: ${data.error.message||data.error.type||JSON.stringify(data.error)}`);
      const text = (data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("");
      if (!text) throw new Error(`No AI response. Status: ${response.status}. Response: ${JSON.stringify(data).slice(0,200)}`);
      const s=text.indexOf("{"),e2=text.lastIndexOf("}");
      if(s===-1) throw new Error("No JSON in AI response: "+text.slice(0,100));
      const parsed=JSON.parse(text.slice(s,e2+1));
      if(!parsed.exerciseIds||parsed.exerciseIds.length!==10) throw new Error("Could not build routine");
      onStart(parsed.label||"Custom Routine",parsed.exerciseIds);
    } catch(e) {
      setError(e.message||"Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <div style={{background:DARK.bg,borderRadius:14,padding:24,width:"100%",maxWidth:480,border:"0.5px solid "+DARK.border}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:500,margin:0}}>AI Routine Generator</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18,lineHeight:1}}>&#10005;</button>
        </div>
        <p style={{fontSize:13,color:DARK.text2,margin:"0 0 14px",lineHeight:1.5}}>Describe how you are feeling or what you need. A 10-exercise routine will be built for you.</p>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))generate();}} placeholder="e.g. I just went cycling and my legs are tight. My neck is also sore." rows={3} style={{width:"100%",boxSizing:"border-box",resize:"none",marginBottom:12,fontSize:14,lineHeight:1.5,padding:"10px 12px",borderRadius:8,border:"0.5px solid "+DARK.border,background:DARK.bg2,color:DARK.text,fontFamily:"inherit"}}/>
        {error&&<p style={{fontSize:12,color:"#C00000",margin:"0 0 10px"}}>{error}</p>}
        <button onClick={generate} disabled={!prompt.trim()||loading} style={{width:"100%",padding:"11px",borderRadius:8,fontSize:14,fontWeight:500,background:(!prompt.trim()||loading)?DARK.bg2:DARK.text,color:(!prompt.trim()||loading)?DARK.text3:DARK.bg,border:"none",cursor:(!prompt.trim()||loading)?"default":"pointer"}}>
          {loading?"Building your routine...":"Generate Routine"}
        </button>
        <p style={{fontSize:11,color:DARK.text3,margin:"10px 0 0",textAlign:"center"}}>Cmd/Ctrl + Enter to generate</p>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("routines");
  const [completions, setCompletions] = useState(HISTORY_SEED);
  const [customRoutines, setCustomRoutines] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [routineType, setRoutineType] = useState("Stretching"); // for Routines tab S/M toggle
  const [exFilterType, setExFilterType] = useState("All");      // for Exercises tab All/S/M
  const [filterRegion, setFilterRegion] = useState("All");
  const [filterFav, setFilterFav] = useState(false);
  const [filterWorkOn, setFilterWorkOn] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [exSortBy, setExSortBy] = useState("name");
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [selectedEx, setSelectedEx] = useState(null);
  const [showNewRoutine, setShowNewRoutine] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showExercisesToAdd, setShowExercisesToAdd] = useState(false);
  const [exercisesToAddNotes, setExercisesToAddNotes] = useState("• Single Knee to Chest Stretch\n");
  const [showAddCompletion, setShowAddCompletion] = useState(false);
  const [editCompletionId, setEditCompletionId] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState(null);
  const [editCompletionFields, setEditCompletionFields] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null); // {type, id, label}
  const chartRef = useRef(null);

  useEffect(() => {
    async function loadFromSupabase() {
      try {
        // Load from Supabase
        const [cmps, crs, ces] = await Promise.all([
          sbFetch("completions?order=date.desc"),
          sbFetch("custom_routines?order=created_at.asc"),
          sbFetch("custom_exercises?order=created_at.asc"),
        ]);

        // Map Supabase snake_case to app camelCase
        const mappedCmps = cmps.map(c => ({
          id: c.id,
          routineId: c.routine_id,
          routineName: c.routine_name,
          routineType: c.routine_type || "",
          date: c.date,
          exerciseIds: c.exercise_ids || [],
        }));
        const mappedCrs = crs.map(r => ({
          id: r.id,
          name: r.name,
          type: r.type,
          exerciseIds: r.exercise_ids || [],
          isCustom: true,
        }));
        const mappedCes = ces.map(e => e.data);

        // Merge with HISTORY_SEED: Supabase completions take priority
        const supabaseIds = new Set(mappedCmps.map(c => c.id));
        const seedOnly = HISTORY_SEED.filter(c => !supabaseIds.has(c.id));
        const allCompletions = [...mappedCmps, ...seedOnly]
          .sort((a, b) => b.date.localeCompare(a.date));

        if (allCompletions.length) setCompletions(allCompletions);
        if (mappedCrs.length) setCustomRoutines(mappedCrs);
        if (mappedCes.length) setCustomExercises(mappedCes);

        // Also cache in localStorage as fallback
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            completions: allCompletions,
            customRoutines: mappedCrs,
            customExercises: mappedCes,
          }));
        } catch(e) {}

      } catch(err) {
        // Supabase unavailable — fall back to localStorage
        console.warn("Supabase load failed, using localStorage:", err.message);
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const d = JSON.parse(raw);
            if (d.completions?.length) setCompletions(d.completions);
            if (d.customRoutines?.length) setCustomRoutines(d.customRoutines);
            if (d.customExercises?.length) setCustomExercises(d.customExercises);
          }
        } catch(e) {}
      }
      setLoaded(true);
    }
    loadFromSupabase();
  }, []);

  const save = useCallback((cmps, crs, ces) => {
    // Always write to localStorage immediately (fast, offline-safe)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({completions:cmps,customRoutines:crs,customExercises:ces})); } catch(e) {}
  }, []);

  // Supabase sync helpers — called after local state updates
  const sbSaveCompletion = useCallback(async (c) => {
    try {
      await sbFetch("completions", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: JSON.stringify({
          id: c.id,
          routine_id: c.routineId,
          routine_name: c.routineName,
          routine_type: c.routineType || "",
          date: c.date,
          exercise_ids: c.exerciseIds || [],
        }),
      });
    } catch(e) { console.warn("Supabase sync failed:", e.message); }
  }, []);

  const sbDeleteCompletion = useCallback(async (id) => {
    // Don't delete HISTORY_SEED items from Supabase (they were never written there)
    if (id.startsWith("h-")) return;
    try {
      await sbFetch("completions?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        prefer: "return=minimal",
      });
    } catch(e) { console.warn("Supabase delete failed:", e.message); }
  }, []);

  const sbSaveCustomRoutine = useCallback(async (r) => {
    try {
      await sbFetch("custom_routines", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: JSON.stringify({
          id: r.id,
          name: r.name,
          type: r.type,
          exercise_ids: r.exerciseIds || [],
        }),
      });
    } catch(e) { console.warn("Supabase sync failed:", e.message); }
  }, []);

  const sbDeleteCustomRoutine = useCallback(async (id) => {
    try {
      await sbFetch("custom_routines?id=eq." + encodeURIComponent(id), {
        method: "DELETE",
        prefer: "return=minimal",
      });
    } catch(e) { console.warn("Supabase delete failed:", e.message); }
  }, []);

  const sbSaveCustomExercise = useCallback(async (e) => {
    try {
      await sbFetch("custom_exercises", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: JSON.stringify({ id: e.id, data: e }),
      });
    } catch(e) { console.warn("Supabase sync failed:", e.message); }
  }, []);

  const showToast = msg => {
    const el = document.createElement("div");
    el.textContent = msg;
    Object.assign(el.style, {position:"fixed",bottom:"24px",left:"50%",transform:"translateX(-50%)",background:DARK.bg,border:"0.5px solid #ccc",borderRadius:"8px",padding:"10px 18px",fontSize:"13px",fontWeight:"500",zIndex:"9999",whiteSpace:"nowrap",boxShadow:"0 2px 12px rgba(0,0,0,0.1)"});
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  // ── Computed data ──────────────────────────────────────────
  const exerciseCompletionCounts = useMemo(() => {
    // Purely derived from history — 100% matches what you see in History tab
    const counts = {};

    // Named routines (routineId starts with "r-"): count via exercise membership
    const routineCompletions = {};
    completions.forEach(c => {
      if (c.routineId?.startsWith("r-")) {
        routineCompletions[c.routineId] = (routineCompletions[c.routineId]||0)+1;
      }
    });
    EXERCISES.forEach(ex => {
      counts[ex.id] = 0;
      (ex.routines||[]).forEach(rName => {
        counts[ex.id] += routineCompletions[`r-${rName}`]||0;
      });
    });

    // Generated/custom routines only: count via direct exerciseIds
    // (skip named routines to avoid double-counting)
    completions.forEach(c => {
      if (!c.routineId?.startsWith("r-")) {
        (c.exerciseIds||[]).forEach(id => { counts[id] = (counts[id]||0)+1; });
      }
    });

    return counts;
  }, [completions]);

  // Last completed date per exercise (for recency scoring in Generate)
  const exerciseLastCompleted = useMemo(() => {
    const last = {};
    EXERCISES.forEach(ex => {
      (ex.routines||[]).forEach(rName => {
        const rid = `r-${rName}`;
        completions.filter(c=>c.routineId===rid).forEach(c => {
          if (!last[ex.id] || c.date > last[ex.id]) last[ex.id] = c.date;
        });
      });
    });
    completions.forEach(c => {
      (c.exerciseIds||[]).forEach(id => {
        if (!last[id] || c.date > last[id]) last[id] = c.date;
      });
    });
    return last;
  }, [completions]);


  const allExercises = useMemo(() => {
    // Merge: custom exercises override base exercises by id, new custom ones appended
    const overrideMap = {};
    customExercises.forEach(e => { overrideMap[e.id] = e; });
    const base = EXERCISES.map(e => overrideMap[e.id] || e);
    const newCustom = customExercises.filter(e => !EXERCISES.find(b => b.id === e.id));
    return [...base, ...newCustom];
  }, [customExercises]);

  const regions = useMemo(() => {
    const all = new Set();
    allExercises.forEach(e => (e.muscleTags||[e.bodyRegion]).forEach(t => t && all.add(t)));
    return ["All", ...Array.from(all).sort()];
  }, [allExercises]);

  const filteredExercises = useMemo(() => {
    const filtered = allExercises.filter(e => {
      if (exFilterType!=="All" && e.type!==exFilterType) return false;
      if (filterRegion!=="All" && !(e.muscleTags||[e.bodyRegion]).includes(filterRegion)) return false;
      if (filterFav && e.favorite!=="Favorite") return false;
      if (filterWorkOn && e.workOn!=="Work On") return false;
      if (searchQ && !e.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
      return true;
    });
    if (exSortBy==="completions") return filtered.sort((a,b) => (exerciseCompletionCounts[b.id]||0)-(exerciseCompletionCounts[a.id]||0));
    if (exSortBy==="bodyPart") return filtered.sort((a,b) => (a.bodyRegion||"").localeCompare(b.bodyRegion||"")||a.name.localeCompare(b.name));
    return filtered.sort((a,b) => a.name.localeCompare(b.name));
  }, [allExercises, exFilterType, filterRegion, filterFav, filterWorkOn, searchQ, exSortBy, exerciseCompletionCounts]);

  const allRoutines = useMemo(() => sortRoutines([...ROUTINES_BASE, ...customRoutines]), [customRoutines]);

  const recentExercisesByType = useMemo(() => {
    const result = { Stretching: { last3: new Set(), last6: new Set() }, Mobility: { last3: new Set(), last6: new Set() } };
    ["Stretching","Mobility"].forEach(type => {
      // Get completions of this type, sorted newest first
      const typed = completions
        .filter(c => {
          const r = allRoutines.find(rt => rt.id === c.routineId);
          return (r?.type || c.routineType) === type;
        })
        .sort((a,b) => b.date.localeCompare(a.date));

      // For named routines, expand to exercise IDs via routine definition
      typed.slice(0, 6).forEach((c, i) => {
        const r = allRoutines.find(rt => rt.id === c.routineId);
        const ids = c.exerciseIds?.length > 0
          ? c.exerciseIds
          : (r?.exerciseIds || []);
        ids.forEach(id => {
          if (i < 3) result[type].last3.add(id);
          result[type].last6.add(id);
        });
      });
    });
    return result;
  }, [completions, allRoutines]);

  const exerciseRoutineCount = useMemo(() => {
    const counts = {};
    EXERCISES.forEach(ex => { counts[ex.id] = ex.routines?.length||0; });
    return counts;
  }, []);

  const filteredRoutines = useMemo(() => {
    const today = new Date();
    const routineCompletionMap = {};
    completions.forEach(c => { routineCompletionMap[c.routineId] = (routineCompletionMap[c.routineId]||0)+1; });
    return allRoutines
      .filter(r => r.type===routineType)
      .map(r => {
        const last = completions.filter(c=>c.routineId===r.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
        const daysSince = last ? Math.floor((today-new Date(last.date+"T12:00:00"))/86400000) : 999;
        const count = routineCompletionMap[r.id]||0;
        const maxCount = Math.max(...allRoutines.map(p=>routineCompletionMap[p.id]||0),1);
        const exs = r.exerciseIds.map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean);
        const avgExDone = exs.length ? exs.reduce((s,e)=>s+(exerciseCompletionCounts[e.id]||0),0)/exs.length : 0;
        const exRarityScore = 1-Math.min(avgExDone,20)/20;
        const rarityBoost = count<=3?0.2:0;
        const score = (Math.min(daysSince,60)/60)*0.4+(1-(count/(maxCount+1)))*0.25+exRarityScore*0.25+rarityBoost;
        return {r,score};
      })
      .sort((a,b)=>b.score-a.score)
      .map(s=>s.r);
  }, [allRoutines, routineType, completions, exerciseCompletionCounts]);

  const lastCompleted = useCallback(routineId => completions.filter(c=>c.routineId===routineId).sort((a,b)=>b.date.localeCompare(a.date))[0]?.date||null, [completions]);
  const completionCount = useCallback(routineId => completions.filter(c=>c.routineId===routineId).length, [completions]);

  const thisMonth = useMemo(() => completions.filter(c=>c.date?.startsWith(new Date().toISOString().slice(0,7))).length, [completions]);
  const thisWeek = useMemo(() => {
    const now=new Date(); const ws=new Date(now); ws.setDate(now.getDate()-now.getDay());
    return completions.filter(c=>c.date>=ws.toISOString().split("T")[0]).length;
  }, [completions]);
  const topRoutine = useMemo(() => {
    const counts={}; completions.forEach(c=>{counts[c.routineName]=(counts[c.routineName]||0)+1;});
    return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  }, [completions]);

  const weeklyData = useMemo(() => {
    const weeks=[]; const today=new Date();
    const dayOfWeek=today.getDay();
    const lastSunday=new Date(today); lastSunday.setDate(today.getDate()-dayOfWeek);
    for(let w=23;w>=0;w--){
      const weekStart=new Date(lastSunday); weekStart.setDate(lastSunday.getDate()-w*7);
      const weekEnd=new Date(weekStart); weekEnd.setDate(weekStart.getDate()+6);
      const ws=weekStart.toISOString().split("T")[0]; const we=weekEnd.toISOString().split("T")[0];
      const inWeek=completions.filter(c=>c.date>=ws&&c.date<=we);
      const stretching=inWeek.filter(c=>{const r=allRoutines.find(rt=>rt.id===c.routineId);return (r?.type||c.routineType)==="Stretching";}).length;
      const mobility=inWeek.filter(c=>{const r=allRoutines.find(rt=>rt.id===c.routineId);return (r?.type||c.routineType)==="Mobility";}).length;
      weeks.push({label:weekStart.toLocaleDateString("en-US",{month:"short",day:"numeric"}),stretching,mobility,total:stretching+mobility});
    }
    return weeks;
  }, [completions, allRoutines]);
 // For each type, compute which exercise IDs appeared in the last N completions
  const logCompletion = useCallback((routine, exerciseIds) => {
    const c={id:`n-${Date.now()}`,routineId:routine.id,routineName:routine.name,routineType:routine.type||"",date:new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"}),exerciseIds:exerciseIds||[]};
    const updated=[c,...completions]; setCompletions(updated); save(updated,customRoutines,customExercises);
    sbSaveCompletion(c);
    showToast(`Logged ${routine.name}`);
  }, [completions, customRoutines, customExercises, save, sbSaveCompletion]);

  const deleteCompletion = useCallback(id => {
    const updated=completions.filter(c=>c.id!==id); setCompletions(updated); save(updated,customRoutines,customExercises);
    sbDeleteCompletion(id);
  }, [completions, customRoutines, customExercises, save, sbDeleteCompletion]);

  const deleteCustomExercise = useCallback(id => {
    const updated=customExercises.filter(e=>e.id!==id); setCustomExercises(updated); save(completions,customRoutines,updated);
    showToast("Exercise deleted");
  }, [completions, customRoutines, customExercises, save]);

  const updateExercise = useCallback((exerciseId, fields) => {
    setCustomExercises(prev => {
      const existing=prev.find(e=>e.id===exerciseId);
      let updated;
      if(existing) {
        updated = prev.map(e=>e.id===exerciseId?{...e,...fields}:e);
      } else {
        const base=EXERCISES.find(e=>e.id===exerciseId);
        updated = base?[...prev,{...base,...fields}]:prev;
      }
      save(completions,customRoutines,updated);
      const saved = updated.find(e=>e.id===exerciseId);
      if (saved) sbSaveCustomExercise(saved);
      return updated;
    });
    setActiveWorkout(aw=>aw?{...aw,exercises:aw.exercises.map(e=>e.id===exerciseId?{...e,...fields}:e)}:aw);
  }, [completions, customRoutines, save, sbSaveCustomExercise]);

  const startWorkout = useCallback(routine => {
    const exs=routine.exerciseIds.map(id=>{const ce=customExercises.find(e=>e.id===id);return ce||EXERCISES.find(e=>e.id===id);}).filter(Boolean);
    if(!exs.length){showToast("No exercises in this routine");return;}
    setActiveWorkout({routine,exercises:exs});
  }, [customExercises]);

  

    const completeWorkout = useCallback(() => {
    logCompletion(activeWorkout.routine, activeWorkout.exercises.map(e=>e.id)); setActiveWorkout(null);
  }, [activeWorkout, logCompletion]);

  const swapWorkoutExercise = useCallback((idx, newEx) => {
    setActiveWorkout(aw => aw ? {
      ...aw,
      exercises: aw.exercises.map((e, i) => i === idx ? newEx : e)
    } : aw);
  }, []);

  const saveGeneratedRoutine = useCallback(() => {
    if (!activeWorkout) return;
    const rt = activeWorkout.routine;
    const prefix = rt.type === "Stretching" ? "S" : "M";
    // Find highest existing number for this prefix
    const existing = allRoutines.filter(r => r.name.match(new RegExp(`^${prefix}\\d+$`)));
    const maxNum = existing.reduce((max, r) => {
      const n = parseInt(r.name.replace(prefix, ""), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const nextName = `${prefix}${maxNum + 1}`;
    const newRoutine = {
      id: `cr-${Date.now()}`,
      name: nextName,
      type: rt.type,
      exerciseIds: activeWorkout.exercises.map(e => e.id),
    };
    const updated = [...customRoutines, newRoutine];
    setCustomRoutines(updated);
    save(completions, updated, customExercises);
    showToast(`Saved as ${nextName}`);
    sbSaveCustomRoutine(newRoutine);
  }, [activeWorkout, allRoutines, customRoutines, completions, customExercises, save, sbSaveCustomRoutine]);

  const saveNewRoutine = useCallback(routine => {
    const updated=[...customRoutines,routine]; setCustomRoutines(updated); save(completions,updated,customExercises);
    setShowNewRoutine(false); showToast(`Created ${routine.name}`);
    sbSaveCustomRoutine(routine);
  }, [customRoutines, completions, customExercises, save, sbSaveCustomRoutine]);

  const handleAiRoutine = useCallback((label,exerciseIds) => {
    const exs=exerciseIds.map(id=>EXERCISES.find(e=>e.id===id)).filter(Boolean);
    if(!exs.length) return;
    const fakeRoutine={id:`ai-${Date.now()}`,name:"Custom: "+label,type:"Mixed",exerciseIds};
    setShowAiModal(false); setActiveWorkout({routine:fakeRoutine,exercises:exs});
  }, []);

  const deleteCustomRoutine = useCallback(id => {
    const updated=customRoutines.filter(r=>r.id!==id); setCustomRoutines(updated); save(completions,updated,customExercises);
    showToast("Routine deleted");
    sbDeleteCustomRoutine(id);
  }, [customRoutines, completions, customExercises, save, sbDeleteCustomRoutine]);

  // ── Chart scroll to right ─────────────────────────────────
  useEffect(() => {
    if (tab === "history" && chartRef.current) {
      setTimeout(() => { if (chartRef.current) chartRef.current.scrollLeft = chartRef.current.scrollWidth; }, 50);
    }
  }, [tab, weeklyData]);

  if (!loaded) return (
    <>
      <style>{DARK_STYLE}</style>
      <div style={{padding:40,textAlign:"center",color:DARK.text2}}>Loading...</div>
    </>
  );

  if (activeWorkout) return (
    <>
    <style>{DARK_STYLE}</style>
    <div style={{padding:"20px 0"}}>
      <WorkoutView routine={activeWorkout.routine} exercises={activeWorkout.exercises} onComplete={completeWorkout} onExit={()=>setActiveWorkout(null)} onUpdateExercise={updateExercise} onSaveRoutine={activeWorkout.routine.id?.startsWith("gen-")?saveGeneratedRoutine:null} onSwapExercise={swapWorkoutExercise} exerciseCompletionCounts={exerciseCompletionCounts} exerciseLastCompleted={exerciseLastCompleted}/>
    </div>
    </>
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
    <style>{DARK_STYLE}</style>
    <div style={{maxWidth:660,margin:"0 auto",padding:16,background:DARK.bg,minHeight:"100vh",color:DARK.text}}>
      {showAiModal && <AiRoutineModal onStart={handleAiRoutine} onClose={()=>setShowAiModal(false)} exerciseCompletionCounts={exerciseCompletionCounts}/>}
      {confirmDelete && <ConfirmDialog message={`Delete ${confirmDelete.label}?`} onConfirm={()=>{confirmDelete.onConfirm();setConfirmDelete(null);}} onCancel={()=>setConfirmDelete(null)}/>}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h1 style={{fontSize:18,fontWeight:600,margin:0,color:'#ffffff'}}>{"Mark's Stretching & Mobility"}</h1>
        <div style={{fontSize:11,color:DARK.text2,display:"flex",gap:6}}>
          <span>{allExercises.length} exercises</span><span>&#183;</span><span>{completions.length} sessions</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:6,marginBottom:20}}>
        {["Routines","Exercises","History"].map(t => {
          const key=t.toLowerCase(); const active=tab===key;
          return (
            <button key={key} onClick={()=>setTab(key)} style={{
              flex:1, padding:"9px 0", fontSize:13,
              fontWeight:active?700:400,
              background:active?DARK.bg3:"transparent",
              border:"1px solid "+DARK.border,
              borderRadius:8,
              color:active?DARK.text:DARK.text2,
              cursor:"pointer",
              transition:"all 0.15s",
            }}>{t}</button>
          );
        })}
      </div>

      {/* ── ROUTINES TAB ── */}
      {tab==="routines" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:8}}>
            <div style={{display:"flex",gap:0,borderRadius:8,overflow:"hidden",border:"1px solid "+DARK.border}}>
              {[["Stretching",S_COLOR],["Mobility",M_COLOR]].map(([t,color])=>(
                <button key={t} onClick={()=>setRoutineType(t)} style={{padding:"7px 18px",fontSize:13,fontWeight:routineType===t?700:400,background:routineType===t?color:DARK.bg,border:"none",color:routineType===t?"white":DARK.text2,cursor:"pointer",transition:"all 0.15s"}}>{t}</button>
              ))}
            </div>
            <button onClick={()=>setShowNewRoutine(true)} disabled={isGenerating} style={{padding:"6px 14px",borderRadius:6,fontSize:12,fontWeight:600,background:routineType==="Stretching"?S_COLOR:M_COLOR,color:"white",border:"none",cursor:isGenerating?"default":"pointer",flexShrink:0,opacity:isGenerating?0.7:1}}>{isGenerating?"Generating...":"+ Generate"}</button>
          </div>

          {showNewRoutine && <NewRoutineBuilder filterType={routineType} exerciseRoutineCount={exerciseRoutineCount} exerciseCompletionCounts={exerciseCompletionCounts} exerciseLastCompleted={exerciseLastCompleted} recentExercisesByType={recentExercisesByType} onStart={(routine,exs)=>{setShowNewRoutine(false);setActiveWorkout({routine,exercises:exs});}} onClose={()=>setShowNewRoutine(false)}/>}

          {filteredRoutines.map(r => {
            const last=lastCompleted(r.id); const count=completionCount(r.id);
            const typeColor=r.type==="Stretching"?S_COLOR:M_COLOR;
            return (
              <div key={r.id} onClick={()=>startWorkout(r)} style={{background:DARK.bg,borderRadius:10,border:`1px solid ${typeColor}33`,padding:"13px 15px",marginBottom:8,cursor:"pointer",transition:"border-color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=typeColor}
                onMouseLeave={e=>e.currentTarget.style.borderColor=typeColor+"33"}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                    <span style={{fontSize:15,fontWeight:500}}>{r.name}</span>
                    {r.isCustom&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:10,background:S_COLOR+"22",color:S_COLOR,border:`0.5px solid ${S_COLOR}44`}}>custom</span>}
                  </div>
                  
                </div>
                <div style={{marginTop:5,fontSize:12,color:DARK.text2,display:"flex",gap:12,flexWrap:"wrap"}}>
                  {last
                    ? <span>{Math.floor((new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T00:00:00")-new Date(last+"T00:00:00"))/86400000)} days since last completion</span>
                    : <span>Never completed</span>}
                  {count>0&&<span>{count} Completions</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXERCISES TAB ── */}
      {tab==="exercises" && (
        <div>
          <div style={{display:"flex",gap:8,marginBottom:10}}>
            <div style={{flex:1,position:"relative",display:"flex",alignItems:"center"}}>
            <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder={`Search ${allExercises.length} exercises...`} style={{width:"100%",boxSizing:"border-box",paddingRight:searchQ?"28px":"8px"}}/>
            {searchQ&&<button onClick={()=>setSearchQ("")} style={{position:"absolute",right:6,background:"none",border:"none",cursor:"pointer",color:DARK.text3,fontSize:16,lineHeight:1,padding:0}}>&#10005;</button>}
          </div>
            <button onClick={()=>setShowAddExercise(v=>!v)} style={{padding:"6px 12px",borderRadius:6,fontSize:12,fontWeight:600,background:S_COLOR,color:"white",border:"none",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>+ Add</button>
            <button onClick={()=>setShowExercisesToAdd(v=>!v)} style={{padding:"6px 10px",borderRadius:6,fontSize:12,fontWeight:600,background:DARK.bg3,color:DARK.text2,border:"0.5px solid "+DARK.border,cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>&#128203; To Add</button>
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
            {[["All","#888"],["Stretching",S_COLOR],["Mobility",M_COLOR]].map(([t,color])=>{
              const key=t;
              const active=exFilterType===key;
              return <button key={key} onClick={()=>setExFilterType(key)} style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:active?color+"22":"none",color:active?color:DARK.text2,border:`0.5px solid ${active?color+"66":DARK.border2}`,cursor:"pointer"}}>{key}</button>;
            })}
            <button onClick={()=>setFilterFav(f=>!f)} style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:filterFav?"#E8B84B22":"none",color:filterFav?"#E8B84B":DARK.text2,border:`0.5px solid ${filterFav?"#E8B84B66":DARK.border2}`,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:16,color:"#E8B84B",lineHeight:1}}>&#9733;</span> Favorite
            </button>
            <button onClick={()=>setFilterWorkOn(f=>!f)} style={{padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:500,background:filterWorkOn?"#E8B84B22":"none",color:filterWorkOn?"#E8B84B":DARK.text2,border:`0.5px solid ${filterWorkOn?"#E8B84B66":DARK.border2}`,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
              <span style={{color:"#E8B84B",fontSize:12,lineHeight:1}}>&#128170;</span> Work On
            </button>
            <div style={{marginLeft:"auto",display:"flex",gap:4}}>
              {[["name","A-Z"],["completions","Most Completed"]].map(([val,label])=>(
                <button key={val} onClick={()=>setExSortBy(val)} style={{padding:"3px 8px",borderRadius:6,fontSize:11,background:exSortBy===val?DARK.text:DARK.bg2,color:exSortBy===val?DARK.bg:DARK.text2,border:"none",cursor:"pointer"}}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <select value={filterRegion} onChange={e=>setFilterRegion(e.target.value)} style={{width:"100%",fontSize:13}}>
              {regions.map(reg=><option key={reg} value={reg}>{reg==="All"?"Filter by muscle / joint":reg}</option>)}
            </select>
          </div>

          {showExercisesToAdd && (
            <div style={{background:DARK.bg2,borderRadius:10,border:"0.5px solid "+DARK.border,padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <span style={{fontWeight:600,fontSize:14,color:DARK.text}}>Exercises to Add</span>
                <button onClick={()=>setShowExercisesToAdd(false)} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:18}}>&#10005;</button>
              </div>
              <textarea value={exercisesToAddNotes} onChange={e=>setExercisesToAddNotes(e.target.value)} rows={8} style={{width:"100%",boxSizing:"border-box",resize:"vertical",fontSize:13,lineHeight:1.6,background:DARK.bg3,color:DARK.text,border:"1px solid #555",borderRadius:6,padding:"8px 10px",fontFamily:"inherit"}} placeholder="Add exercises you want to add..."/>
              <div style={{fontSize:11,color:DARK.text3,marginTop:6}}>Notes auto-save as you type</div>
            </div>
          )}
          {showAddExercise && <AddExerciseForm onSave={ex=>{const updated=[...customExercises,ex];setCustomExercises(updated);save(completions,customRoutines,updated);sbSaveCustomExercise(ex);setShowAddExercise(false);showToast(`Added ${ex.name}`);}} onClose={()=>setShowAddExercise(false)}/>}

          <div style={{fontSize:12,color:DARK.text3,marginBottom:10}}>{filteredExercises.length} of {allExercises.length} exercises</div>

          <div style={{display:"grid",gap:6}}>
            {filteredExercises.map(e=>{
              const c=REGION_COLORS[e.bodyRegion]||"#888";
              const sel=selectedEx?.id===e.id;
              const tags=(e.muscleTags||[e.bodyRegion]);
              return (
                <div key={e.id} style={{borderRadius:8,border:sel?`1.5px solid ${c}`:"0.5px solid "+DARK.border2,background:sel?c+"0d":DARK.bg,transition:"all 0.12s",overflow:"hidden"}}>
                  <div onClick={()=>setSelectedEx(sel?null:e)} style={{padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0,flex:1}}>
                        <span style={{fontSize:13,fontWeight:500,lineHeight:1.3}}>{e.name}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:4,background:e.type==="Stretching"?S_COLOR:M_COLOR,color:"white",flexShrink:0}}>{e.type==="Stretching"?"S":"M"}</span>
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
                        {e.favorite==="Favorite"&&<span style={{fontSize:15,color:"#E8B84B",lineHeight:1}}>&#9733;</span>}
                        {e.workOn==="Work On"&&<span style={{fontSize:12,color:"#e06666",lineHeight:1}}>&#128170;</span>}
                        {(exerciseCompletionCounts[e.id]||0)===0
                          ? <span style={{fontSize:11,color:"#ff6666",fontWeight:600}}>Never Completed</span>
                          : <>{exerciseLastCompleted[e.id]&&<span style={{fontSize:11,color:DARK.text3}}>{Math.floor((new Date(new Date().toLocaleDateString("en-CA",{timeZone:"America/Los_Angeles"})+"T00:00:00")-new Date(exerciseLastCompleted[e.id]+"T00:00:00"))/86400000)}d</span>}<span style={{fontSize:11,color:DARK.text3,fontWeight:500}}>{exerciseCompletionCounts[e.id]}&#215;</span></>}
                      </div>
                    </div>
                    <div style={{marginTop:5,display:"flex",gap:4,flexWrap:"wrap"}}>
                      {tags.map(t=><Tag key={t} label={t} color={REGION_COLORS[t]||c}/>)}
                      {e.reps&&e.type!=="Stretching"&&e.reps!=="N/A"&&<span style={{fontSize:11,color:DARK.text3,alignSelf:"center"}}>{e.reps}</span>}
                    </div>
                  </div>
                  {sel && <ExerciseInlineEdit e={e} liveCount={exerciseCompletionCounts[e.id]||0} lastDate={exerciseLastCompleted[e.id]||null}
                    onUpdate={(id,fields)=>{setCustomExercises(p=>{const ex=p.find(x=>x.id===id);const updated=ex?p.map(x=>x.id===id?{...x,...fields}:x):[...p,{...EXERCISES.find(x=>x.id===id),...fields}];save(completions,customRoutines,updated);const saved=updated.find(x=>x.id===id);if(saved)sbSaveCustomExercise(saved);return updated;});}}
                    onDelete={e.id.startsWith('cex-')?()=>setConfirmDelete({label:e.name,onConfirm:()=>{deleteCustomExercise(e.id);setSelectedEx(null);}}):null}
                  />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab==="history" && (
        <div>
          {/* Chart */}
          <div style={{background:DARK.bg2,borderRadius:12,padding:"16px 16px 12px",marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <span style={{fontSize:13,fontWeight:500}}>Weekly sessions</span>
              <div style={{display:"flex",gap:14,fontSize:11,color:DARK.text2}}>
                <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:10,height:10,borderRadius:2,background:S_COLOR,display:"inline-block",flexShrink:0}}></span>Stretching</span>
                <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:10,height:10,borderRadius:2,background:M_COLOR,display:"inline-block",flexShrink:0}}></span>Mobility</span>
              </div>
            </div>
            {(() => {
              const chartH=90, barW=36, gap=10, GOAL=4;
              const maxVal=Math.max(...weeklyData.map(w=>w.total),GOAL,1);
              const goalY=Math.round((1-GOAL/maxVal)*chartH);
              const totalW=weeklyData.length*(barW+gap);
              return (
                <div ref={chartRef} style={{overflowX:"auto",overflowY:"visible",paddingBottom:4}}>
                  <div style={{position:"relative",paddingTop:20,minWidth:totalW}}>
                    <svg style={{position:"absolute",top:20,left:0,width:totalW,height:chartH,pointerEvents:"none",overflow:"visible",zIndex:1}}>
                      <line x1="0" y1={goalY} x2={totalW} y2={goalY} stroke="#C00000" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.85"/>
                      <text x="4" y={goalY-3} fontSize="9" fill="#C00000" opacity="0.9">goal (4)</text>
                    </svg>
                    <div style={{display:"flex",alignItems:"flex-end",gap:gap}}>
                      {weeklyData.map((w,i)=>{
                        const sH=Math.round((w.stretching/maxVal)*chartH);
                        const mH=Math.round((w.mobility/maxVal)*chartH);
                        const totalBarH=sH+mH;
                        return (
                          <div key={i} style={{width:barW,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center"}}>
                            <div style={{width:"100%",height:chartH,position:"relative",display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                              {w.total>0&&<span style={{position:"absolute",bottom:totalBarH+3,left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:600,color:DARK.text2,whiteSpace:"nowrap"}}>{w.total}</span>}
                              {w.total===0
                                ?<div style={{width:"100%",height:3,background:DARK.border2,borderRadius:2}}/>
                                :<div style={{width:"100%",display:"flex",flexDirection:"column",borderRadius:"3px 3px 2px 2px",overflow:"hidden"}}>
                                  {mH>0&&<div style={{width:"100%",height:mH,background:M_COLOR}}/>}
                                  {sH>0&&<div style={{width:"100%",height:sH,background:S_COLOR}}/>}
                                </div>
                              }
                            </div>
                            <span style={{fontSize:9,color:DARK.text3,marginTop:5,textAlign:"center",lineHeight:1.3,whiteSpace:"nowrap"}}>{w.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>



          {/* Add + table */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <span style={{fontSize:13,fontWeight:500,color:DARK.text2}}>{completions.length} sessions</span>
            <button onClick={()=>setShowAddCompletion(v=>!v)} style={{padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:600,background:M_COLOR,color:"white",border:"none",cursor:"pointer"}}>+ Add</button>
          </div>

          {showAddCompletion && <AddCompletionForm allRoutines={allRoutines} onAdd={c=>{const updated=[c,...completions];setCompletions(updated);save(updated,customRoutines,customExercises);sbSaveCompletion(c);setShowAddCompletion(false);showToast("Added completion");}} onClose={()=>setShowAddCompletion(false)}/>}

          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead>
                <tr style={{borderBottom:"1px solid "+DARK.border}}>
                  {["Date","Routine","Type",""].map(h=><th key={h} style={{textAlign:"left",padding:"6px 8px",fontSize:11,fontWeight:600,color:DARK.text2,whiteSpace:"nowrap"}}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {completions.map((c,idx)=>{
                  const r=allRoutines.find(rt=>rt.id===c.routineId);
                  const typeColor=r?.type==="Stretching"?S_COLOR:M_COLOR;
                  return (
                    <React.Fragment key={c.id}>
                    <tr style={{borderBottom:editCompletionId===c.id?"none":"0.5px solid "+DARK.border2,background:idx%2===0?"transparent":DARK.bg2}}>
                      <td style={{padding:"8px 8px",whiteSpace:"nowrap",color:DARK.text2}}>{fmtDate(c.date)}</td>
                      <td style={{padding:"8px 8px",fontWeight:500}}>
                        {c.exerciseIds&&c.exerciseIds.length>0
                          ? <div>
                              <span onClick={()=>setExpandedHistory(v=>v===c.id?null:c.id)} style={{cursor:"pointer",borderBottom:"1px dotted "+DARK.border2,color:DARK.text}}>{c.routineName}</span>
                              {expandedHistory===c.id&&(
                                <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:2}}>
                                  {c.exerciseIds.map(id=>{
                                    const ex=allExercises.find(e=>e.id===id);
                                    return ex?<span key={id} style={{fontSize:11,color:DARK.text2,paddingLeft:8}}>&#8226; {ex.name}</span>:null;
                                  })}
                                </div>
                              )}
                            </div>
                          : <span style={{color:DARK.text}}>{c.routineName}</span>
                        }
                      </td>
                      <td style={{padding:"8px 8px"}}>
                        {(r?.type||c.routineType)?<span style={{fontSize:11,padding:"1px 7px",borderRadius:10,background:(r?.type||c.routineType)==="Stretching"?S_COLOR+"22":M_COLOR+"22",color:(r?.type||c.routineType)==="Stretching"?S_COLOR:M_COLOR,border:`0.5px solid ${(r?.type||c.routineType)==="Stretching"?S_COLOR:M_COLOR}44`,whiteSpace:"nowrap"}}>{r?.type||c.routineType}</span>:null}
                      </td>
                      <td style={{padding:"8px 4px",textAlign:"right",whiteSpace:"nowrap"}}>
                        <button onClick={()=>{if(editCompletionId===c.id){setEditCompletionId(null);}else{setEditCompletionId(c.id);setEditCompletionFields({date:c.date,routineId:c.routineId,routineName:c.routineName});}}} style={{background:"none",border:"none",cursor:"pointer",color:DARK.text2,fontSize:12,padding:"2px 6px"}}>Edit</button>
                      </td>
                    </tr>
                    {editCompletionId===c.id&&(
                      <tr style={{borderBottom:"0.5px solid "+DARK.border2,background:DARK.bg3}}>
                        <td colSpan={4} style={{padding:"8px 12px"}}>
                          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
                            <div>
                              <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Date</div>
                              <input type="date" value={editCompletionFields.date||""} onChange={ev=>setEditCompletionFields(p=>({...p,date:ev.target.value}))} style={{fontSize:12,padding:"4px 6px"}}/>
                            </div>
                            <div style={{flex:1,minWidth:120}}>
                              <div style={{fontSize:10,color:DARK.text2,marginBottom:3}}>Routine</div>
                              <select value={editCompletionFields.routineId||""} onChange={ev=>{const genNames={"gen-s":"S (generated)","gen-m":"M (generated)"};const r2=allRoutines.find(r=>r.id===ev.target.value);setEditCompletionFields(p=>({...p,routineId:ev.target.value,routineName:r2?.name||genNames[ev.target.value]||p.routineName}));}} style={{width:"100%",fontSize:12}}>
                                {sortRoutines(allRoutines).map(r2=><option key={r2.id} value={r2.id}>{r2.name}</option>)}
                                <option value="gen-s" style={{background:DARK.bg3}}>S (generated)</option>
                                <option value="gen-m" style={{background:DARK.bg3}}>M (generated)</option>
                              </select>
                            </div>
                            <div style={{display:"flex",gap:6}}>
                              <button onClick={()=>{const updated=completions.map(x=>x.id===c.id?{...x,...editCompletionFields}:x);setCompletions(updated);save(updated,customRoutines,customExercises);const edited=updated.find(x=>x.id===c.id);if(edited&&!c.id.startsWith("h-"))sbSaveCompletion(edited);setEditCompletionId(null);showToast("Updated");}} style={{padding:"5px 12px",borderRadius:6,fontSize:12,fontWeight:600,background:S_COLOR,color:"white",border:"none",cursor:"pointer"}}>Save</button>
                              <button onClick={()=>setEditCompletionId(null)} style={{padding:"5px 10px",borderRadius:6,fontSize:12,background:"none",border:"0.5px solid "+DARK.border2,color:DARK.text2,cursor:"pointer"}}>Cancel</button>
                              <button onClick={()=>{setEditCompletionId(null);setConfirmDelete({label:`${c.routineName} on ${fmtDate(c.date)}`,onConfirm:()=>deleteCompletion(c.id)});}} style={{padding:"5px 10px",borderRadius:6,fontSize:12,background:"none",border:"0.5px solid #e0444466",color:"#e04444",cursor:"pointer"}}>Delete</button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
const HISTORY_SEED = [
  {"id":"h-1","routineId":"r-S2","routineName":"S2","date":"2025-03-05"},
  {"id":"h-2","routineId":"r-S3","routineName":"S3","date":"2025-03-06"},
  {"id":"h-3","routineId":"r-M1","routineName":"M1","date":"2025-03-09"},
  {"id":"h-4","routineId":"r-M2","routineName":"M2","date":"2025-03-10"},
  {"id":"h-5","routineId":"r-S1","routineName":"S1","date":"2025-03-12"},
  {"id":"h-6","routineId":"r-S2","routineName":"S2","date":"2025-03-13"},
  {"id":"h-7","routineId":"r-S3","routineName":"S3","date":"2025-03-23"},
  {"id":"h-8","routineId":"r-M1","routineName":"M1","date":"2025-03-24"},
  {"id":"h-9","routineId":"r-M2","routineName":"M2","date":"2025-03-25"},
  {"id":"h-10","routineId":"r-S3","routineName":"S3","date":"2025-03-27"},
  {"id":"h-11","routineId":"r-S4","routineName":"S4","date":"2025-03-31"},
  {"id":"h-12","routineId":"r-M3","routineName":"M3","date":"2025-04-02"},
  {"id":"h-13","routineId":"r-M4","routineName":"M4","date":"2025-04-03"},
  {"id":"h-14","routineId":"r-S1","routineName":"S1","date":"2025-04-07"},
  {"id":"h-15","routineId":"r-S4","routineName":"S4","date":"2025-04-09"},
  {"id":"h-16","routineId":"r-M3","routineName":"M3","date":"2025-04-11"},
  {"id":"h-17","routineId":"r-M4","routineName":"M4","date":"2025-04-13"},
  {"id":"h-18","routineId":"r-S1","routineName":"S1","date":"2025-04-14"},
  {"id":"h-19","routineId":"r-S2","routineName":"S2","date":"2025-04-15"},
  {"id":"h-20","routineId":"r-S3","routineName":"S3","date":"2025-04-17"},
  {"id":"h-21","routineId":"r-S4","routineName":"S4","date":"2025-04-19"},
  {"id":"h-22","routineId":"r-M1","routineName":"M1","date":"2025-04-20"},
  {"id":"h-23","routineId":"r-M2","routineName":"M2","date":"2025-04-22"},
  {"id":"h-24","routineId":"r-M3","routineName":"M3","date":"2025-04-23"},
  {"id":"h-25","routineId":"r-M4","routineName":"M4","date":"2025-04-24"},
  {"id":"h-26","routineId":"r-S2","routineName":"S2","date":"2025-04-25"},
  {"id":"h-27","routineId":"r-S1","routineName":"S1","date":"2025-04-30"},
  {"id":"h-28","routineId":"r-S3","routineName":"S3","date":"2025-05-01"},
  {"id":"h-29","routineId":"r-S5","routineName":"S5","date":"2025-05-04"},
  {"id":"h-30","routineId":"r-S6","routineName":"S6","date":"2025-05-05"},
  {"id":"h-31","routineId":"r-M5","routineName":"M5","date":"2025-05-06"},
  {"id":"h-32","routineId":"r-M6","routineName":"M6","date":"2025-05-07"},
  {"id":"h-33","routineId":"r-S5","routineName":"S5","date":"2025-05-08"},
  {"id":"h-34","routineId":"r-S6","routineName":"S6","date":"2025-05-11"},
  {"id":"h-35","routineId":"r-M5","routineName":"M5","date":"2025-05-12"},
  {"id":"h-36","routineId":"r-M6","routineName":"M6","date":"2025-05-14"},
  {"id":"h-37","routineId":"r-S1","routineName":"S1","date":"2025-05-16"},
  {"id":"h-38","routineId":"r-S2","routineName":"S2","date":"2025-05-19"},
  {"id":"h-39","routineId":"r-S3","routineName":"S3","date":"2025-05-20"},
  {"id":"h-40","routineId":"r-M1","routineName":"M1","date":"2025-05-27"},
  {"id":"h-41","routineId":"r-M2","routineName":"M2","date":"2025-05-28"},
  {"id":"h-42","routineId":"r-S6","routineName":"S6","date":"2025-05-29"},
  {"id":"h-43","routineId":"r-S5","routineName":"S5","date":"2025-06-02"},
  {"id":"h-44","routineId":"r-S4","routineName":"S4","date":"2025-06-04"},
  {"id":"h-45","routineId":"r-S1","routineName":"S1","date":"2025-06-05"},
  {"id":"h-46","routineId":"r-M5","routineName":"M5","date":"2025-06-05"},
  {"id":"h-47","routineId":"r-M1","routineName":"M1","date":"2025-06-06"},
  {"id":"h-48","routineId":"r-M2","routineName":"M2","date":"2025-06-07"},
  {"id":"h-49","routineId":"r-S7","routineName":"S7","date":"2025-06-08"},
  {"id":"h-50","routineId":"r-S8","routineName":"S8","date":"2025-06-09"},
  {"id":"h-51","routineId":"r-M7","routineName":"M7","date":"2025-06-10"},
  {"id":"h-52","routineId":"r-S7","routineName":"S7","date":"2025-06-11"},
  {"id":"h-53","routineId":"r-S8","routineName":"S8","date":"2025-06-16"},
  {"id":"h-54","routineId":"r-M8","routineName":"M8","date":"2025-06-17"},
  {"id":"h-55","routineId":"r-S5","routineName":"S5","date":"2025-06-22"},
  {"id":"h-56","routineId":"r-M7","routineName":"M7","date":"2025-06-23"},
  {"id":"h-57","routineId":"r-S1","routineName":"S1","date":"2025-06-29"},
  {"id":"h-58","routineId":"r-S4","routineName":"S4","date":"2025-06-30"},
  {"id":"h-59","routineId":"r-S3","routineName":"S3","date":"2025-07-06"},
  {"id":"h-60","routineId":"r-M8","routineName":"M8","date":"2025-07-07"},
  {"id":"h-61","routineId":"r-S5","routineName":"S5","date":"2025-07-11"},
  {"id":"h-62","routineId":"r-S1","routineName":"S1","date":"2025-07-13"},
  {"id":"h-63","routineId":"r-M5","routineName":"M5","date":"2025-07-14"},
  {"id":"h-64","routineId":"r-M6","routineName":"M6","date":"2025-07-16"},
  {"id":"h-65","routineId":"r-M2","routineName":"M2","date":"2025-07-19"},
  {"id":"h-66","routineId":"r-S6","routineName":"S6","date":"2025-07-20"},
  {"id":"h-67","routineId":"r-S8","routineName":"S8","date":"2025-07-21"},
  {"id":"h-68","routineId":"r-M8","routineName":"M8","date":"2025-07-22"},
  {"id":"h-69","routineId":"r-S5","routineName":"S5","date":"2025-07-27"},
  {"id":"h-70","routineId":"r-M1","routineName":"M1","date":"2025-07-28"},
  {"id":"h-71","routineId":"r-S4","routineName":"S4","date":"2025-07-30"},
  {"id":"h-72","routineId":"r-M3","routineName":"M3","date":"2025-08-01"},
  {"id":"h-73","routineId":"r-M6","routineName":"M6","date":"2025-08-05"},
  {"id":"h-74","routineId":"r-M2","routineName":"M2","date":"2025-08-06"},
  {"id":"h-75","routineId":"r-M2","routineName":"M2","date":"2025-09-11"},
  {"id":"h-76","routineId":"r-S7","routineName":"S7","date":"2025-09-11"},
  {"id":"h-77","routineId":"r-S8","routineName":"S8","date":"2025-09-14"},
  {"id":"h-78","routineId":"r-S2","routineName":"S2","date":"2025-09-15"},
  {"id":"h-79","routineId":"r-S4","routineName":"S4","date":"2025-09-16"},
  {"id":"h-80","routineId":"r-M8","routineName":"M8","date":"2025-09-17"},
  {"id":"h-81","routineId":"r-M7","routineName":"M7","date":"2025-09-19"},
  {"id":"h-82","routineId":"r-S1","routineName":"S1","date":"2025-09-21"},
  {"id":"h-83","routineId":"r-S7","routineName":"S7","date":"2025-09-22"},
  {"id":"h-84","routineId":"r-M4","routineName":"M4","date":"2025-09-25"},
  {"id":"h-85","routineId":"r-M5","routineName":"M5","date":"2025-09-28"},
  {"id":"h-86","routineId":"r-S9","routineName":"S9","date":"2025-10-02"},
  {"id":"h-87","routineId":"r-S10","routineName":"S10","date":"2025-10-06"},
  {"id":"h-88","routineId":"r-M9","routineName":"M9","date":"2025-10-08"},
  {"id":"h-89","routineId":"r-M10","routineName":"M10","date":"2025-10-14"},
  {"id":"h-90","routineId":"r-S9","routineName":"S9","date":"2025-10-19"},
  {"id":"h-91","routineId":"r-M9","routineName":"M9","date":"2025-10-21"},
  {"id":"h-92","routineId":"r-S10","routineName":"S10","date":"2025-10-21"},
  {"id":"h-93","routineId":"r-M10","routineName":"M10","date":"2025-10-23"},
  {"id":"h-94","routineId":"r-S9","routineName":"S9","date":"2025-10-23"},
  {"id":"h-95","routineId":"r-S10","routineName":"S10","date":"2025-10-26"},
  {"id":"h-96","routineId":"r-M9","routineName":"M9","date":"2025-10-28"},
  {"id":"h-97","routineId":"r-M10","routineName":"M10","date":"2025-10-30"},
  {"id":"h-98","routineId":"r-S2","routineName":"S2","date":"2025-10-30"},
  {"id":"h-99","routineId":"r-S8","routineName":"S8","date":"2025-11-02"},
  {"id":"h-100","routineId":"r-S7","routineName":"S7","date":"2025-11-11"},
  {"id":"h-101","routineId":"r-M3","routineName":"M3","date":"2025-11-13"},
  {"id":"h-102","routineId":"r-S6","routineName":"S6","date":"2025-11-17"},
  {"id":"h-103","routineId":"r-M7","routineName":"M7","date":"2025-11-18"},
  {"id":"h-104","routineId":"r-M9","routineName":"M9","date":"2025-12-04"},
  {"id":"h-105","routineId":"r-M10","routineName":"M10","date":"2025-12-10"},
  {"id":"h-106","routineId":"r-M4","routineName":"M4","date":"2025-12-12"},
  {"id":"h-107","routineId":"r-S9","routineName":"S9","date":"2025-12-14"},
  {"id":"h-108","routineId":"r-S10","routineName":"S10","date":"2025-12-17"},
  {"id":"h-109","routineId":"r-M6","routineName":"M6","date":"2026-01-01"},
  {"id":"h-110","routineId":"r-M7","routineName":"M7","date":"2026-01-03"},
  {"id":"h-111","routineId":"r-M8","routineName":"M8","date":"2026-01-04"},
  {"id":"h-112","routineId":"r-M9","routineName":"M9","date":"2026-01-08"},
  {"id":"h-113","routineId":"r-S9","routineName":"S9","date":"2026-01-08"},
  {"id":"h-114","routineId":"r-S10","routineName":"S10","date":"2026-01-10"},
  {"id":"h-115","routineId":"r-M10","routineName":"M10","date":"2026-01-16"},
  {"id":"h-116","routineId":"r-S5","routineName":"S5","date":"2026-01-18"},
  {"id":"h-117","routineId":"r-S9","routineName":"S9","date":"2026-01-19"},
  {"id":"h-118","routineId":"r-M11","routineName":"M11","date":"2026-01-25"},
  {"id":"h-119","routineId":"r-M12","routineName":"M12","date":"2026-01-26"},
  {"id":"h-120","routineId":"r-S11","routineName":"S11","date":"2026-01-26"},
  {"id":"h-121","routineId":"r-M11","routineName":"M11","date":"2026-01-27"},
  {"id":"h-122","routineId":"r-M12","routineName":"M12","date":"2026-01-28"},
  {"id":"h-123","routineId":"r-S12","routineName":"S12","date":"2026-01-30"},
  {"id":"h-124","routineId":"r-M13","routineName":"M13","date":"2026-02-01"},
  {"id":"h-125","routineId":"r-M5","routineName":"M5","date":"2026-02-02"},
  {"id":"h-126","routineId":"r-S11","routineName":"S11","date":"2026-02-03"},
  {"id":"h-127","routineId":"r-M11","routineName":"M11","date":"2026-02-04"},
  {"id":"h-128","routineId":"r-M13","routineName":"M13","date":"2026-02-05"},
  {"id":"h-129","routineId":"r-S12","routineName":"S12","date":"2026-02-06"},
  {"id":"h-130","routineId":"r-M1","routineName":"M1","date":"2026-02-08"},
  {"id":"h-131","routineId":"r-M8","routineName":"M8","date":"2026-02-09"},
  {"id":"h-132","routineId":"r-S10","routineName":"S10","date":"2026-02-10"},
  {"id":"h-133","routineId":"r-M14","routineName":"M14","date":"2026-02-15"},
  {"id":"h-134","routineId":"r-M12","routineName":"M12","date":"2026-02-16"},
  {"id":"h-135","routineId":"r-M14","routineName":"M14","date":"2026-02-17"},
  {"id":"h-136","routineId":"r-S2","routineName":"S2","date":"2026-02-18"},
  {"id":"h-137","routineId":"r-M2","routineName":"M2","date":"2026-02-19"},
  {"id":"h-138","routineId":"r-M13","routineName":"M13","date":"2026-02-24"},
  {"id":"h-139","routineId":"r-S11","routineName":"S11","date":"2026-02-26"},
  {"id":"h-140","routineId":"r-M14","routineName":"M14","date":"2026-02-27"},
  {"id":"h-141","routineId":"r-M10","routineName":"M10","date":"2026-03-02"},
  {"id":"h-142","routineId":"r-M9","routineName":"M9","date":"2026-03-03"},
  {"id":"h-143","routineId":"r-M6","routineName":"M6","date":"2026-03-04"},
  {"id":"h-144","routineId":"r-S10","routineName":"S10","date":"2026-03-05"},
  {"id":"h-145","routineId":"r-S12","routineName":"S12","date":"2026-03-06"},
  {"id":"h-146","routineId":"r-M4","routineName":"M4","date":"2026-03-09"},
  {"id":"h-147","routineId":"r-M3","routineName":"M3","date":"2026-03-10"},
  {"id":"h-148","routineId":"r-M1","routineName":"M1","date":"2026-03-13"},
  {"id":"h-149","routineId":"r-S2","routineName":"S2","date":"2026-03-15"},
  {"id":"h-150","routineId":"r-M15","routineName":"M15","date":"2026-03-17"},
  {"id":"h-151","routineId":"r-M16","routineName":"M16","date":"2026-03-17"},
  {"id":"h-152","routineId":"r-S13","routineName":"S13","date":"2026-03-18"},
  {"id":"h-153","routineId":"r-M15","routineName":"M15","date":"2026-03-22"},
  {"id":"h-154","routineId":"r-M16","routineName":"M16","date":"2026-03-23"},
  {"id":"h-155","routineId":"r-M11","routineName":"M11","date":"2026-03-24"},
  {"id":"h-156","routineId":"r-M7","routineName":"M7","date":"2026-03-25"},
  {"id":"h-157","routineId":"r-S14","routineName":"S14","date":"2026-03-26"},
  {"id":"h-158","routineId":"r-M15","routineName":"M15","date":"2026-03-27"},
  {"id":"h-159","routineId":"r-M16","routineName":"M16","date":"2026-03-30"},
  {"id":"h-160","routineId":"r-M12","routineName":"M12","date":"2026-03-31"},
  {"id":"h-161","routineId":"r-S2","routineName":"S2","date":"2026-04-01"},
  {"id":"h-162","routineId":"r-S3","routineName":"S3","date":"2026-04-02"},
  {"id":"h-163","routineId":"r-M14","routineName":"M14","date":"2026-04-06"},
  {"id":"h-164","routineId":"r-S5","routineName":"S5","date":"2026-04-08"},
  {"id":"h-165","routineId":"r-M1","routineName":"M1","date":"2026-04-10"},
  {"id":"h-166","routineId":"r-S4","routineName":"S4","date":"2026-04-11"},
  {"id":"h-167","routineId":"r-M8","routineName":"M8","date":"2026-04-12"},
  {"id":"h-168","routineId":"r-M12","routineName":"M12","date":"2026-04-14"},
  {"id":"h-169","routineId":"r-S6","routineName":"S6","date":"2026-04-15"},
  {"id":"h-170","routineId":"r-M13","routineName":"M13","date":"2026-04-16"}
];

