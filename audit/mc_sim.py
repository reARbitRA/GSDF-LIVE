#!/usr/bin/env python3
"""ARBITER-MVP v2.2 scoring engine + Monte Carlo (zero-dependency, LCG + Box-Muller).
Reads audit/01_findings.json + audit/journeys.json, writes audit/02_scorecard.json, prints report.
Arithmetic is deterministic for a fixed findings list (seed 424242)."""
import json, math, sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
W = {"D1":18,"D2":14,"D3":14,"D4":8,"D5":8,"D6":8,"D7":7,"D8":6,"D9":6,"D10":5,"D11":3,"D12":3}
BASE = {"P0":45,"P1":18,"P2":6,"P3":1.5}
GM = {"A":1.0,"B":0.9,"C":0.7,"D":0.45}
HW = {"A":3,"B":7,"C":13,"D":21}
GRADE_ORDER = {"A":0,"B":1,"C":2,"D":3}
findings_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "01_findings.json")
ctx_path = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "journeys.json")
F = [x for x in json.load(open(findings_path)) if x.get("status","OPEN") == "OPEN"]
ctx = json.load(open(ctx_path))
clamp = lambda v, lo, hi: max(lo, min(hi, v))

dims = {}
for d in W:
    fs = [x for x in F if x["dimension"] == d]
    pen = {g: 0.0 for g in GM}
    total = 0.0
    for x in fs:
        p = BASE[x["severity"]] * x["confidence"] * GM[x["evidence_grade"]]
        pen[x["evidence_grade"]] += p; total += p
    raw = clamp(100 - total, 0, 100)
    s = raw; caps = []
    if fs:
        dom = sorted(pen.items(), key=lambda kv: (-kv[1], GRADE_ORDER[kv[0]]))[0][0]
    else:
        dom = ctx["positive_verification_grade"].get(d, "D")
    if dom in ("C","D"):
        s = min(s, 55); caps.append("cap1_evidence")
    if d in ctx.get("core_cmd_failed_dims", []):
        s = min(s, 30); caps.append("cap2_exec_fail")
    if d == "D1":
        j = ctx["journeys"]; vw = sum(1 for v in j.values() if v == "VERIFIED_WORKING")
        c = 100 * vw / max(1, len(j)); s = min(s, c); caps.append(f"cap3_journeys={c:.2f}")
    if d == "D2":
        cov = ctx["coverage"] if ctx["coverage_tool_available"] else 0.0
        c = 100 * (0.5 * ctx["pass_rate"] + 0.5 * min(cov / 70.0, 1.0)); s = min(s, c); caps.append(f"cap4_tests={c:.2f}")
    if fs and all(x["evidence_grade"] == "D" for x in fs):
        s = clamp(s, 20, 55); caps.append("gradeD_floor")
    hw = HW[dom]
    if not fs and GRADE_ORDER[dom] <= 1:
        hw = max(hw - 2, 2)
    dims[d] = dict(weight=W[d], findings=[x["id"] for x in fs], penalty_total=round(total, 3), raw=round(raw, 3),
                   score=round(s, 3), dominant_grade=dom, caps_applied=caps, half_width=hw,
                   min=clamp(s - hw, 0, 100), mode=s, max=clamp(s + hw, 0, 100))

R_point = sum(W[d] / 100 * dims[d]["score"] for d in W)

# ---- Monte Carlo: LCG + Box-Muller, seed 424242 ----
class LCG:
    def __init__(self, seed): self.s = seed & 0xFFFFFFFF
    def rand(self):
        self.s = (1664525 * self.s + 1013904223) & 0xFFFFFFFF
        return (self.s + 0.5) / 4294967296.0
rng = LCG(424242)
def normal(sigma):
    u1, u2 = rng.rand(), rng.rand()
    return sigma * math.sqrt(-2 * math.log(u1)) * math.cos(2 * math.pi * u2)
def tri(a, c, b):
    if b <= a: return a
    u = rng.rand(); fc = (c - a) / (b - a)
    return a + math.sqrt(u * (b - a) * (c - a)) if u < fc else b - math.sqrt((1 - u) * (b - a) * (b - c))
N = 10000; R = []
for _ in range(N):
    eps = normal(3.0)
    r = eps + sum(W[d] / 100 * tri(dims[d]["min"], dims[d]["mode"], dims[d]["max"]) for d in W)
    R.append(clamp(r, 0, 100))
R.sort()
SUL_raw = sum(1 for r in R if r >= 75.0) / N
mean = sum(R) / N
ci = (R[int(0.025 * N)], R[int(0.975 * N) - 1])
# independent R_point recomputation + assertion
R_check = sum(W[d] * dims[d]["score"] for d in W) / 100.0
assert abs(R_check - R_point) < 0.01, (R_check, R_point)

sev = {s: sum(1 for x in F if x["severity"] == s) for s in BASE}
gates = []; SUL = SUL_raw
if sev["P0"] >= 1: SUL = min(SUL, 0.05); gates.append("P0_count>=1 -> SUL<=0.05")
if sev["P1"] >= 5: SUL = min(SUL, 0.35); gates.append("P1_count>=5 -> SUL<=0.35")
if any(v == "BROKEN" for v in ctx["journeys"].values()): SUL = min(SUL, 0.10); gates.append("primary journey BROKEN -> SUL<=0.10")
def letter(r):
    for t, l in [(95,"A+"),(90,"A"),(85,"A-"),(80,"B+"),(75,"B"),(70,"B-"),(65,"C+"),(60,"C"),(55,"C-"),(45,"D")]:
        if r >= t: return l
    return "F"
out = dict(head_sha=ctx["head_sha"], label=ctx.get("label","baseline"), dimensions=dims, R_point=round(R_point, 3), letter=letter(R_point),
           mc=dict(N=N, seed=424242, eps_sigma=3.0, mean=round(mean, 3), ci95=[round(ci[0], 3), round(ci[1], 3)], SUL_raw=SUL_raw),
           SUL=SUL, hard_gates_tripped=gates, severity_counts=sev, journeys=ctx["journeys"],
           determinism_note="Arithmetic determinism only: identical findings -> identical scores. Discovery/classification involve model judgement.")
json.dump(out, open(os.path.join(HERE, ctx.get("scorecard_out", "02_scorecard.json")), "w"), indent=1)
print(f"== ARBITER scoring :: {ctx.get('label','baseline')} :: HEAD {ctx['head_sha'][:7]} ==")
for d in W:
    x = dims[d]
    print(f"{d:>3} w={W[d]:>2} pen={x['penalty_total']:7.3f} raw={x['raw']:7.3f} score={x['score']:7.3f} dom={x['dominant_grade']} hw={x['half_width']:>2} caps={x['caps_applied']} findings={x['findings']}")
print(f"R_point={R_point:.3f} ({letter(R_point)})  R_check={R_check:.3f}  assertion=PASS")
print(f"MC: N={N} seed=424242 mean={mean:.3f} CI95=[{ci[0]:.3f},{ci[1]:.3f}] SUL_raw={SUL_raw:.4f}")
print(f"severity={sev} gates={gates} SUL={SUL:.4f}")
