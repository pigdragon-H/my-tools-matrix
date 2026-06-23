import subprocess, json, re, time
from pathlib import Path

slugs = [
 'loan-calculator','mortgage-calculator','credit-card-payoff-calculator','debt-to-income-calculator','compound-interest-calculator','retirement-calculator','cagr-calculator','savings-goal-calculator','inflation-adjuster','net-worth-calculator','debt-payoff-calculator','budget-ratio-calculator','emergency-fund-calculator','salary-after-tax-calculator','hourly-rate-calculator','meeting-cost-calculator','pomodoro-calculator'
]
base='https://my-tools-matrix-production.up.railway.app/tools/finance/'
out=[]
ignore_phrases=['Formula Universe','Tools','Knowledge','About','Search tools','Sign in','sponsored content']
for i, slug in enumerate(slugs,1):
    url=base+slug+f'?audit=zh-{int(time.time())}'
    cp=subprocess.run(['browser-tool','navigate',url], text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, timeout=45)
    txt=cp.stdout
    m=re.search(r'Page text: (.*?)(?:\n\nScreenshot:|$)', txt, re.S)
    page=m.group(1) if m else txt
    # remove known global shared UI noise
    clean=page
    for ph in ignore_phrases:
        clean=clean.replace(ph,'')
    # collect ASCII words likely visible; allow acronyms/units but count for review
    words=sorted(set(re.findall(r'\b[A-Za-z][A-Za-z+\-]{2,}\b', clean)))
    out.append({'idx':i,'slug':slug,'word_count':len(words),'words':words[:80],'sample':clean[:900]})
    print(f'{i:02d} {slug}: {len(words)} words {words[:25]}')
Path('outputs').mkdir(exist_ok=True)
Path('outputs/prod_audit_finance_1_17.json').write_text(json.dumps(out, ensure_ascii=False, indent=2))
