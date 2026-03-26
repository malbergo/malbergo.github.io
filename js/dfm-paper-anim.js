/* js/dfm-paper-anim.js
   Discrete Flow Maps — Paper thumbnail animation
   Three-panel canvas: flow map projection, parallel generation, reward steering
   Colors from mean_denoiser.py / stochastic_interpolant_frame.py */

(function () {
  'use strict';

  var canvas = document.getElementById('dfm-anim');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, visible = false, raf = 0;

  /* ── Colors ── */
  var bg = '#ffffff', ink = '#2e4552', maroon = '#965c58';
  var sfill = '#f2eee0', edge = '#c3c3c3', cloud = '#90a0aa';
  var g1 = '#2f533f', g2 = '#3d604c', g3 = '#4c6b5a', red = '#c0504d';
  var gc = [g1, g2, g3];

  /* ── Math ── */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerp2(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function ease(t) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  function cbez(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return [
      u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0],
      u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]
    ];
  }

  function dot(p, c, r, a) {
    ctx.save(); ctx.globalAlpha = a == null ? 1 : a;
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.283);
    ctx.fillStyle = c; ctx.fill(); ctx.restore();
  }

  function miniVerts(cx, cy, s) {
    return [[cx - s, cy + s * .6], [cx, cy - s * 1.1], [cx + s, cy + s * .6]];
  }

  function drawMini(vs, op) {
    ctx.save();
    ctx.globalAlpha = op * .35;
    ctx.beginPath();
    ctx.moveTo(vs[0][0], vs[0][1]);
    ctx.lineTo(vs[1][0], vs[1][1]);
    ctx.lineTo(vs[2][0], vs[2][1]);
    ctx.closePath();
    ctx.fillStyle = sfill; ctx.fill();
    ctx.globalAlpha = op;
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
    for (var i = 0; i < 3; i++) dot(vs[i], ink, 2, op * .5);
  }

  /* ── Resize ── */
  function resize() {
    var r = canvas.getBoundingClientRect();
    dpr = devicePixelRatio || 1;
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ── Label helper ── */
  function mathLabel(text, pos, color, size, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity == null ? 1 : opacity;
    ctx.font = 'italic ' + (size || 11) + "px 'Times New Roman',Georgia,serif";
    ctx.fillStyle = color || ink;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, pos[0], pos[1]);
    ctx.restore();
  }

  function boldLabel(text, pos, color, size, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity == null ? 1 : opacity;
    ctx.font = '600 ' + (size || 11) + 'px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = color || ink;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, pos[0], pos[1]);
    ctx.restore();
  }

  /* ═══════════════════════════════════════════════
     Panel 1: Flow Map Projection
     Geometry matches SimplexRenderer & SectionMeanDenoiser
     from discrete-flow-maps main.js exactly.
     ═══════════════════════════════════════════════ */
  function drawShadow(now, ox, oy, pw, ph) {
    ctx.save(); ctx.translate(ox, oy);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

    // Scale: smaller so vertex labels fit with padding
    var s = Math.min(pw, ph) * .19;
    var cx = pw * .5, cy = ph * .36;
    var ls = Math.max(8, s * .22); // label font size

    // Simplex vertices (exact ratios from SimplexRenderer)
    var vFox = [cx - s * 1.8, cy + s * 1.0]; // bottom-left
    var vDog = [cx,            cy - s * 1.4]; // top
    var vCat = [cx + s * 1.8, cy + s * 1.0]; // bottom-right

    // Draw simplex
    ctx.beginPath();
    ctx.moveTo(vFox[0], vFox[1]); ctx.lineTo(vDog[0], vDog[1]); ctx.lineTo(vCat[0], vCat[1]);
    ctx.closePath();
    ctx.globalAlpha = .5; ctx.fillStyle = sfill; ctx.fill();
    ctx.globalAlpha = 1; ctx.strokeStyle = ink; ctx.lineWidth = 1.5; ctx.stroke();

    // Vertex dots & labels (offset outward so they don't overlap the triangle)
    dot(vFox, ink, 3.5, 1); dot(vDog, ink, 3.5, 1); dot(vCat, ink, 3.5, 1);
    boldLabel('fox', [vFox[0] - ls * 1.6, vFox[1] + ls * .5], ink, ls);
    boldLabel('dog', [vDog[0], vDog[1] - ls * 1.2], ink, ls);
    boldLabel('cat', [vCat[0] + ls * 1.6, vCat[1] + ls * .5], ink, ls);

    // ODE trajectory (exact control points from trajectoryData())
    var baseY = vFox[1];
    var x0 = [cx + s * 0.022, baseY + s * 1.719];
    var x1 = [vFox[0], vFox[1]];
    var cp1 = [x0[0] + s * 0.608, x0[1] - s * 1.204];
    var cp2 = [x1[0] + s * 1.399, x1[1] + s * 0.400];

    // Draw full trajectory curve
    ctx.globalAlpha = 1; ctx.beginPath();
    for (var i = 0; i <= 80; i++) {
      var tp = cbez(x0, cp1, cp2, x1, i / 80);
      i ? ctx.lineTo(tp[0], tp[1]) : ctx.moveTo(tp[0], tp[1]);
    }
    ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.stroke();

    // Key parameters (from DFM site constants)
    var xsP = 0.16, xtP = 0.34;
    var xs = cbez(x0, cp1, cp2, x1, xsP);

    // ψ_{s,s} — barycentric (P_FOX=0.32, P_DOG=0.14, P_CAT=0.54)
    var psiSS = [.32*vFox[0] + .14*vDog[0] + .54*vCat[0],
                 .32*vFox[1] + .14*vDog[1] + .54*vCat[1]];

    // Tangent at x_s aimed toward ψ_{s,s} (matches DFM site behavior)
    var tanDx = psiSS[0] - xs[0], tanDy = psiSS[1] - xs[1];
    var tanD = Math.hypot(tanDx, tanDy);
    var tanUx = tanDx / tanD, tanUy = tanDy / tanD;
    var tanLen = s * .8;
    var tanEnd = [xs[0] + tanUx * tanLen, xs[1] + tanUy * tanLen];

    // Animated sweep: xₜ moves from near xₛ to xtP
    var sw = (Math.sin(now / 3500 - 1.5708) + 1) / 2;
    var tP = lerp(xsP + .04, xtP, sw);
    var xCur = cbez(x0, cp1, cp2, x1, tP);

    // ψ_{s,t} — interior point on the secant chord through simplex
    // Interpolate from ψ_{s,s} toward a foxward point as sweep progresses
    var psiFoxward = [.50*vFox[0] + .18*vDog[0] + .32*vCat[0],
                      .50*vFox[1] + .18*vDog[1] + .32*vCat[1]];
    var psiST = lerp2(psiSS, psiFoxward, sw);

    // — Tangent ray from xₛ toward ψ_{s,s} —
    ctx.globalAlpha = .8;
    ctx.beginPath(); ctx.moveTo(xs[0], xs[1]); ctx.lineTo(tanEnd[0], tanEnd[1]);
    ctx.strokeStyle = g1; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();

    // — Dashed projection: xₛ → ψₛ,ₛ —
    ctx.globalAlpha = .5; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(xs[0], xs[1]); ctx.lineTo(psiSS[0], psiSS[1]);
    ctx.strokeStyle = g1; ctx.lineWidth = 1.5; ctx.stroke();

    // — Dashed projection: xₜ → ψₛ,ₜ —
    ctx.beginPath(); ctx.moveTo(xCur[0], xCur[1]); ctx.lineTo(psiST[0], psiST[1]);
    ctx.strokeStyle = g1; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.setLineDash([]);

    // — ψ path on simplex: arched connector ψₛ,ₛ → ψₛ,ₜ —
    ctx.globalAlpha = .6; ctx.beginPath();
    var psiMid = [(psiSS[0]+psiST[0])/2, (psiSS[1]+psiST[1])/2 - s*.14];
    ctx.moveTo(psiSS[0], psiSS[1]);
    ctx.quadraticCurveTo(psiMid[0], psiMid[1], psiST[0], psiST[1]);
    ctx.strokeStyle = g1; ctx.lineWidth = 2; ctx.stroke();

    // — Secant arrow xₛ → xₜ —
    ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(xs[0], xs[1]); ctx.lineTo(xCur[0], xCur[1]);
    ctx.strokeStyle = maroon; ctx.lineWidth = 2; ctx.stroke();
    var adx = xCur[0]-xs[0], ady = xCur[1]-xs[1], aa = Math.atan2(ady, adx), hl = 6;
    ctx.beginPath(); ctx.moveTo(xCur[0], xCur[1]);
    ctx.lineTo(xCur[0]-hl*Math.cos(aa-.35), xCur[1]-hl*Math.sin(aa-.35));
    ctx.lineTo(xCur[0]-hl*Math.cos(aa+.35), xCur[1]-hl*Math.sin(aa+.35));
    ctx.closePath(); ctx.fillStyle = maroon; ctx.fill();

    // — Dots —
    dot(x0, maroon, 4, 1);
    dot(xs, maroon, 4, 1);
    dot(xCur, maroon, 4, 1);
    dot(psiSS, g1, 5, 1);
    dot(psiST, g1, 5, 1);

    // — Labels —
    mathLabel('x\u2080', [x0[0] + ls*1.2, x0[1] + ls*.3], maroon, ls);
    mathLabel('x\u209B', [xs[0] + ls*1.2, xs[1] + ls*.2], maroon, ls);
    mathLabel('x\u209C', [xCur[0] - ls*1.3, xCur[1] + ls*.2], maroon, ls);
    mathLabel('x\u2081', [x1[0] - ls*.6, x1[1] + ls*1.3], maroon, ls);
    mathLabel('\u03C8\u209B,\u209B', [psiSS[0] + ls*1.5, psiSS[1] - ls*.9], g1, ls);
    mathLabel('\u03C8\u209B,\u209C', [psiST[0] - ls*1.8, psiST[1] - ls*.9], g1, ls);

    // Panel label
    ctx.globalAlpha = .45;
    ctx.font = '600 8px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = ink; ctx.textAlign = 'center';
    ctx.fillText('FLOW MAP PROJECTION', pw / 2, ph - 8);

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════
     Panel 2: Parallel Generation
     ═══════════════════════════════════════════════ */
  var parT = [2, 0, 1, 2, 1], parN = 5, parPer = 4000;

  function drawParallel(now, ox, oy, pw, ph) {
    ctx.save(); ctx.translate(ox, oy);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

    var phase = (now % parPer) / parPer;
    var flowT = clamp(phase * 2.2, 0, 1);
    var fade = phase > .85 ? clamp((phase - .85) / .15, 0, 1) : 0;
    var op = 1 - fade;

    var sp = pw / (parN + 1), ms = Math.min(sp * .32, ph * .18);

    for (var i = 0; i < parN; i++) {
      var cx = sp * (i + 1), cy = ph * .38;
      var vs = miniVerts(cx, cy, ms);
      drawMini(vs, op);

      // Noise point below each simplex
      var ny = cy + ms * 2 + ((i * 7 + 3) % 5 - 2) * ms * .15;
      var np = [cx, ny];
      var tgt = vs[parT[i]];

      // Staggered flow convergence
      var ft = ease(clamp(flowT - i * .06, 0, 1));
      var cur = lerp2(np, tgt, ft);

      // Curved trail
      ctx.save(); ctx.globalAlpha = .3 * op;
      ctx.beginPath(); ctx.moveTo(np[0], np[1]);
      var mx = lerp(np[0], tgt[0], .5) + (i % 2 ? 6 : -6);
      var my = lerp(np[1], tgt[1], .5);
      ctx.quadraticCurveTo(mx, my, cur[0], cur[1]);
      ctx.strokeStyle = gc[parT[i]]; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();

      dot(cur, gc[parT[i]], 3, op);
      if (ft > .95) dot(tgt, gc[parT[i]], ms * .2, .25 + .1 * Math.sin(now / 400));
      if (ft < .05) dot(np, cloud, 2.5, op * .5);
    }

    ctx.globalAlpha = .45;
    ctx.font = '600 8px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = ink; ctx.textAlign = 'center';
    ctx.fillText('PARALLEL GENERATION', pw / 2, ph - 5);

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════
     Panel 3: Reward Steering
     ═══════════════════════════════════════════════ */
  var strG = [0, 2, 0, 0, 2], strR = [1, 2, 2, 1, 0], strN = 5, strPer = 5500;

  function drawSteering(now, ox, oy, pw, ph) {
    ctx.save(); ctx.translate(ox, oy);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, pw, ph);

    var phase = (now % strPer) / strPer;
    var greenT = clamp(phase * 3, 0, 1);
    var redT = clamp((phase - .35) * 3, 0, 1);
    var fade = phase > .88 ? clamp((phase - .88) / .12, 0, 1) : 0;
    var op = 1 - fade;

    var sp = pw / (strN + 1), ms = Math.min(sp * .32, ph * .18);

    for (var i = 0; i < strN; i++) {
      var cx = sp * (i + 1), cy = ph * .38;
      var vs = miniVerts(cx, cy, ms);
      drawMini(vs, op);

      var ny = cy + ms * 2 + ((i * 5 + 2) % 4 - 1.5) * ms * .12;
      var np = [cx, ny];

      // Green flow (base model — may land on wrong vertex)
      var gt = vs[strG[i]];
      var gf = ease(clamp(greenT - i * .05, 0, 1));
      var gCur = lerp2(np, gt, gf);

      ctx.save(); ctx.globalAlpha = .25 * op * (redT > 0 ? .5 : 1);
      ctx.beginPath(); ctx.moveTo(np[0], np[1]);
      var gm = [lerp(np[0], gt[0], .5) + (i % 2 ? 5 : -5), lerp(np[1], gt[1], .5)];
      ctx.quadraticCurveTo(gm[0], gm[1], gCur[0], gCur[1]);
      ctx.strokeStyle = g1; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.restore();
      dot(gCur, g1, 2.5, op * (redT > 0 ? .35 : 1));

      // Red flow (steered — cubic bezier veers from green target to correct target)
      if (redT > 0) {
        var rt = vs[strR[i]];
        var rf = ease(clamp(redT - i * .05, 0, 1));

        // Control points: starts heading toward green target, then veers to red
        var c1 = [lerp(np[0], gt[0], .4) + (i % 2 ? 3 : -3), lerp(np[1], gt[1], .4)];
        var c2 = [lerp(np[0], rt[0], .7) + (i % 2 ? -3 : 3), lerp(np[1], rt[1], .7)];
        var rCur = cbez(np, c1, c2, rt, rf);

        ctx.save(); ctx.globalAlpha = .35 * op;
        ctx.beginPath(); ctx.moveTo(np[0], np[1]);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], rCur[0], rCur[1]);
        ctx.strokeStyle = red; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();

        dot(rCur, red, 3, op);
        if (rf > .95) dot(rt, red, ms * .18, .25 + .1 * Math.sin(now / 350));
      }
    }

    ctx.globalAlpha = .45;
    ctx.font = '600 8px system-ui,-apple-system,sans-serif';
    ctx.fillStyle = ink; ctx.textAlign = 'center';
    ctx.fillText('REWARD STEERING', pw / 2, ph - 5);

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════
     Main animation loop
     ═══════════════════════════════════════════════ */
  function frame() {
    if (!visible) { raf = 0; return; }
    var now = performance.now();
    ctx.clearRect(0, 0, W, H);

    var mx = W * .5, my = H * .5;

    drawShadow(now, 0, 0, mx, H);
    drawParallel(now, mx, 0, mx, my);
    drawSteering(now, mx, my, mx, my);

    // Panel separators
    ctx.save();
    ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.globalAlpha = .4;
    ctx.beginPath();
    ctx.moveTo(mx, 0); ctx.lineTo(mx, H);
    ctx.moveTo(mx, my); ctx.lineTo(W, my);
    ctx.stroke();
    ctx.restore();

    raf = requestAnimationFrame(frame);
  }

  // Only animate when canvas is visible
  var obs = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible && !raf) frame();
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: .05 });
  obs.observe(canvas);

  resize();
  window.addEventListener('resize', resize);
})();
