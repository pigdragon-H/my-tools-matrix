from pathlib import Path
import re
root=Path.cwd()
config=(root/'shared/toolsConfig.ts').read_text()
items=re.findall(r'\{\s*id: "([^"]+)",\s*name: "([^"]+)",\s*category: "finance",\s*path: "([^"]+)"', config, re.S)[:19]
route=(root/'client/src/pages/ToolPage.tsx').read_text()
route_map=dict(re.findall(r'"(finance/[^"]+)": lazy\(\(\) => import\("@/tools/([^"]+)"\)\)', route))
keywords=re.compile(r'>[^<]*(Quick|Standard|Example|Examples|Calculator|Result|Intelligence|Knowledge|Definition|Formula|Limitations|FAQ|Common questions|Recommended Tools|Trust|References|Save|Share|Next tools|Decision Path|Gross|Net|Profit|Margin|ROAS|Budget Ratio|Net Worth|Salary After Tax|Meeting Cost|Hourly Rate|Pomodoro|Affiliate disclosure|Educational estimator|accounting advice|advice)[^<]*<')
print('idx,id,name,path,component,status,visible_english_hits')
for idx,(id,name,path) in enumerate(items,1):
    key=path.replace('/tools/','')
    comp_rel=route_map.get(key)
    if not comp_rel:
        print(f'{idx},{id},{name},{path},,NO_ROUTE,')
        continue
    comp_path=root/'client/src/tools'/comp_rel/'index.tsx'
    if not comp_path.exists():
        print(f'{idx},{id},{name},{path},{comp_rel},NO_FILE,')
        continue
    text=comp_path.read_text(errors='ignore')
    samples=[]
    for m in keywords.finditer(text):
        s=re.sub(r'\s+',' ',m.group(0))[:110]
        samples.append(s)
    print(f'{idx},{id},{name},{path},{comp_rel},FOUND,{len(samples)}')
    for s in samples[:6]:
        print('  SAMPLE', s)
