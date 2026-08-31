// CSS compartido por las 8 plantillas — renderizado a tamaño real (1080×1350 /
// 1080×1920), sin escalado: cada plantilla es su propio documento HTML completo.
import { FONT_FACES } from './tokens.mjs'

export const BASE_CSS = `
  ${FONT_FACES}
  *{ box-sizing:border-box; margin:0; padding:0; }
  html,body{ width:100%; height:100%; overflow:hidden; background:#0A0A0A; }
  body{ position:relative; font-family:'Util', sans-serif; color:#EDE7D9; }

  .ph{ position:absolute; inset:0; }
  .ph img{ width:100%; height:100%; object-fit:cover; display:block; filter:saturate(.92) contrast(1.06) brightness(.99); }
  .vignette{ position:absolute; inset:0; box-shadow:inset 0 0 220px 40px rgba(0,0,0,.55); pointer-events:none; }
  .scrim-b{ position:absolute; left:0; right:0; bottom:0; background:linear-gradient(180deg,rgba(10,10,10,0) 0%,rgba(10,10,10,.15) 32%,rgba(10,10,10,.86) 78%,rgba(10,10,10,.97) 100%); }
  .scrim-t{ position:absolute; left:0; right:0; top:0; background:linear-gradient(180deg,rgba(10,10,10,.55) 0%,rgba(10,10,10,0) 100%); }

  .mono{
    position:absolute; width:46px; height:46px; border:1.5px solid #C6A64B; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-family:'Display'; font-weight:700; font-style:italic; font-size:20px; color:#C6A64B;
    background:rgba(10,10,10,.28); z-index:5;
  }
  .eyebrow-tag{
    position:absolute; z-index:5; font-family:'Util'; font-weight:600; font-size:15px;
    letter-spacing:.22em; text-transform:uppercase; color:#C6A64B;
  }
  .badge{
    position:absolute; top:64px; right:64px; z-index:5; padding:12px 22px;
    border:1.5px solid #C6A64B; color:#C6A64B;
    font-family:'Util'; font-weight:600; font-size:16px; letter-spacing:.16em; text-transform:uppercase;
  }

  .stack-bottom{ position:absolute; left:64px; right:64px; bottom:60px; z-index:5; }
  .gold-rule{ width:64px; height:2px; background:#C6A64B; margin-bottom:22px; }
  .name-xl, .name-lg{
    overflow-wrap:break-word; display:-webkit-box; -webkit-box-orient:vertical;
    -webkit-line-clamp:2; overflow:hidden;
  }
  .name-xl{ font-family:'Display'; font-weight:900; font-size:64px; line-height:1.02; margin-bottom:18px; }
  .name-xl.long{ font-size:44px; }
  .name-lg{ font-family:'Display'; font-weight:900; font-size:50px; line-height:1.05; margin-bottom:16px; }
  .name-lg.long{ font-size:36px; }
  .spec-line{ display:flex; flex-wrap:wrap; gap:0 26px; font-family:'Util'; font-weight:500; font-size:19px; color:#EDE7D9; opacity:.92; }
  .spec-line b{ color:#C6A64B; font-weight:600; }
  .dot{ color:#8C7A50; }

  .counter{ position:absolute; right:64px; bottom:60px; z-index:5; font-family:'Util'; font-weight:600; font-size:20px; letter-spacing:.08em; color:#EDE7D9; }
  .counter b{ color:#C6A64B; }
  .dots{ position:absolute; left:64px; bottom:60px; z-index:5; display:flex; gap:8px; }
  .dots span{ width:7px; height:7px; border-radius:50%; background:#2A2A26; }
  .dots span.active{ background:#C6A64B; }

  .p4{ position:absolute; inset:0; padding:150px 64px 64px; display:flex; flex-direction:column; }
  .p4-eyebrow{ font-family:'Util'; font-weight:600; font-size:14px; letter-spacing:.2em; text-transform:uppercase; color:#C6A64B; margin-bottom:20px; }
  .p4-title{ font-family:'Display'; font-weight:900; font-size:46px; line-height:1.06; margin-bottom:8px; }
  .p4-sub{ font-family:'Display'; font-weight:500; font-style:italic; font-size:21px; color:#9C9689; margin-bottom:40px; }
  .specgrid{ display:grid; grid-template-columns:1fr 1fr; column-gap:56px; margin-top:auto; margin-bottom:36px; }
  .specgrid .row{ display:flex; justify-content:space-between; padding:20px 0; border-top:1px solid #2A2A26; gap:16px; }
  .sg-k{ font-family:'Util'; font-weight:600; font-size:14px; letter-spacing:.12em; text-transform:uppercase; color:#9C9689; flex:0 1 auto; min-width:0; }
  .sg-v{ font-family:'Util'; font-weight:600; font-size:19px; color:#EDE7D9; flex:1 1 auto; min-width:0; text-align:right; overflow-wrap:anywhere; }
  .p4-photostrip{ display:flex; gap:10px; height:150px; }
  .p4-photostrip div{ flex:1; overflow:hidden; }
  .p4-photostrip img{ width:100%; height:100%; object-fit:cover; filter:saturate(.9) contrast(1.06) grayscale(.15); }

  .split{ position:absolute; inset:0; display:flex; }
  .split .half{ position:relative; flex:1; overflow:hidden; }
  .split .half img{ width:100%; height:100%; object-fit:cover; filter:saturate(.9) contrast(1.08); }
  .split .divider{ position:absolute; top:0; bottom:0; left:50%; width:2px; background:#C6A64B; transform:translateX(-1px); z-index:6; }
  .split .vs{
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:7;
    width:88px; height:88px; border-radius:50%; background:#0A0A0A; border:1.5px solid #C6A64B;
    display:flex; align-items:center; justify-content:center; font-family:'Display'; font-weight:700; font-style:italic;
    font-size:24px; color:#C6A64B;
  }
  .split .halfcap{ position:absolute; left:36px; right:36px; bottom:44px; z-index:5; }
  .split .halfcap .yr{ font-family:'Util'; font-weight:600; font-size:14px; letter-spacing:.1em; color:#C6A64B; margin-bottom:8px; }
  .split .halfcap .nm{ font-family:'Display'; font-weight:700; font-size:27px; line-height:1.08; }
  .split-head{ position:absolute; top:64px; left:0; right:0; z-index:6; text-align:center; }
  .split-head .k{ font-family:'Util'; font-weight:600; font-size:13px; letter-spacing:.22em; text-transform:uppercase; color:#C6A64B; }

  .p6{ position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; padding:110px 76px; }
  .p6-mark{ font-family:'Display'; font-weight:700; font-style:italic; font-size:15px; color:#C6A64B; margin-bottom:40px; }
  .p6-quote{ font-family:'Display'; font-weight:700; font-style:italic; font-size:52px; line-height:1.18; color:#EDE7D9; }
  .p6-quote em{ color:#C6A64B; font-style:italic; }
  .p6-foot{ margin-top:52px; display:flex; align-items:center; gap:16px; }
  .p6-line{ width:40px; height:1px; background:#8C7A50; }
  .p6-foot span{ font-family:'Util'; font-weight:600; font-size:12.5px; letter-spacing:.16em; text-transform:uppercase; color:#9C9689; }

  .safe-zone{
    position:absolute; left:0; right:0; z-index:4;
    background:repeating-linear-gradient(135deg, rgba(198,166,75,.10) 0 10px, rgba(198,166,75,.04) 10px 20px);
    border-top:1px dashed rgba(198,166,75,.55); border-bottom:1px dashed rgba(198,166,75,.55);
  }
  .safe-zone .lbl{
    position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); white-space:nowrap;
    font-family:'Util'; font-weight:600; font-size:15px; letter-spacing:.14em; text-transform:uppercase;
    color:rgba(198,166,75,.85);
  }

  .p8{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 90px; }
  .p8-mono{ width:64px; height:64px; border:1.5px solid #C6A64B; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Display'; font-weight:700; font-style:italic; font-size:27px; color:#C6A64B; margin-bottom:44px; }
  .p8-h{ font-family:'Display'; font-weight:900; font-size:50px; line-height:1.08; margin-bottom:26px; }
  .p8-p{ font-family:'Display'; font-weight:500; font-style:italic; font-size:21px; color:#9C9689; max-width:22ch; line-height:1.45; margin-bottom:46px; }
  .p8-cta{ display:inline-flex; align-items:center; gap:14px; padding:20px 40px; border:1.5px solid #C6A64B; }
  .p8-cta span{ font-family:'Util'; font-weight:600; font-size:16px; letter-spacing:.14em; text-transform:uppercase; color:#C6A64B; }
`
