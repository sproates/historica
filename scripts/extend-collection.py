import json
from pathlib import Path
p=Path('web/data/collection.json');d=json.loads(p.read_text())
new_sources=[('alexander-chronology','Cambridge University Press · Alexander’s campaign chronology','https://www.cambridge.org/core/services/aop-cambridge-core/content/view/AA5F32E13E20CAFF2ACE09749527E515/9781009408981chr_xiv-xvii.pdf/chronology.pdf'),('archaeology-alexander','Mark Rose · Alexander chronology, Archaeological Institute of America','https://archive.archaeology.org/online/features/alexander/whoswho.html'),('getty-warring','Getty Research Institute · Warring States','https://www.getty.edu/vow/AATFullDisplay?find=300264024&logic=AND&note=&subjectid=300018378'),('rome-frank','Tenney Frank · A History of Rome, chapter IV (1923)','https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/FRAAHR/4*.html'),('monte-alban-inah','Secretaría de Cultura / INAH · Monte Albán','https://sic.cultura.gob.mx/ficha.php?table=zona_arqueologica&table_id=76')]
for id,title,url in new_sources:
 if not any(s['id']==id for s in d['sources']):d['sources'].append({'id':id,'title':title,'url':url,'use':'Evidence for original concise summary, not imported publication text.'})
# Points locate the named place/region approximately; they are not continuous personal observations.
rows=[
('macedonia',-336,-336,'Macedonia','Alexander becomes king',[22.5,40.75],'Alexander succeeds Philip II.','archaeology-alexander'),
('thebes',-335,-335,'Greece','The destruction of Thebes',[23.3,38.3],'Alexander takes Thebes; its inhabitants are killed or enslaved.','archaeology-alexander'),
('asia-minor',-334,-334,'Asia Minor','Crossing into Asia',[27.3,40.3],'The campaign begins with victory at the Granicus.','alexander-chronology'),
('issus',-333,-333,'Cilicia','Battle of Issus',[36.2,36.9],'Alexander defeats Darius III.','alexander-chronology'),
('tyre',-332,-332,'The Levant','Tyre and Gaza',[35.2,33.3],'Sieges carry the campaign down the eastern Mediterranean.','alexander-chronology'),
('egypt',-331,-331,'Egypt','The foundation of Alexandria',[29.9,31.2],'Alexandria is founded in Egypt.','archaeology-alexander'),
('gaugamela',-331,-331,'Mesopotamia','Battle of Gaugamela',[43.4,36.6],'Victory opens the way to Babylon and Susa.','archaeology-alexander'),
('persepolis',-330,-330,'Persia','Persepolis and the Persian heartland',[52.9,29.9],'Alexander reaches Persepolis and Ecbatana; Darius III dies.','alexander-chronology'),
('bactria',-329,-329,'Bactria','Across the Hindu Kush',[66.9,36.77],'Alexander enters Bactria in spring.','iranica-bessos'),
('sogdiana',-328,-327,'Sogdiana and Bactria','Campaigns in Central Asia',[67.0,39.2],'Resistance continues in the eastern territories.','alexander-chronology'),
('hydaspes',-326,-326,'Punjab','The Hydaspes and the limit eastwards',[73.5,32.8],'Battle against Porus; the army later refuses to advance at the Hyphasis.','alexander-chronology'),
('indus',-325,-325,'The Indus valley','Down the Indus',[68.4,25.4],'The army reaches the coast after travelling downriver.','archaeology-alexander'),
('gedrosia',-325,-325,'Gedrosia','The desert crossing',[62.5,26.0],'Alexander crosses the Gedrosian desert.','alexander-chronology'),
('susa',-324,-324,'Susiana','Return to Susa',[48.3,32.2],'Alexander returns to Susa; a dispute with the army follows at Opis.','alexander-chronology'),
('babylon',-323,-323,'Babylonia','Death at Babylon',[44.4,32.5],'Alexander dies in Babylon.','alexander-chronology')]
d['campaign']=[{'id':'stage-'+id,'kind':'campaign','startYear':start,'endYear':end,'title':title,'region':region,'point':point,'displayDate':f'{abs(start)} BCE' if start==end else f'{abs(start)}–{abs(end)} BCE','description':desc,'sourceIds':[source],'precisionNote':'Year-level campaign stage. The point locates the named area approximately; it is not a precise personal position. Connecting lines show stage order, not travelled paths.'}for id,start,end,region,title,point,desc,source in rows]
d['contexts']=[
{'id':'china-warring','kind':'context','startYear':-403,'endYear':-221,'title':'China’s competing states','region':'China','point':[112,34],'displayDate':'403–221 BCE · broad period','description':'Rival states compete within the Zhou world. Courtly patronage and craftsmanship flourish alongside political fragmentation.','precisionNote':'Period context, not an event dated to the selected year. Some chronologies begin the Warring States period in 475 BCE. The marker is a regional reference, not a capital or border.','sourceIds':['getty-warring']},
{'id':'italy-settlement','kind':'context','startYear':-338,'endYear':-327,'title':'Rome after the Latin War','region':'Italy','point':[12.5,41.9],'displayDate':'After 338 BCE · context for this period','description':'Rome reorganises its relationships with the Latin communities after the Latin War.','precisionNote':'Background to the selected year, not a separate annual event. The end of this display interval is editorial: the collection switches to the Samnite War in 326 BCE.','sourceIds':['rome-frank']},
{'id':'samnite-war','kind':'context','startYear':-326,'endYear':-304,'title':'Rome and the Samnites at war','region':'Italy','point':[14.3,41.0],'displayDate':'326–304 BCE · war period','description':'Rome and the Samnites struggle for power in central and southern Italy.','precisionNote':'Conventional date range for the Second Samnite War. The marker locates the broad theatre, not a battle on the selected date.','sourceIds':['rome-frank']},
{'id':'monte-alban','kind':'context','startYear':-500,'endYear':-100,'title':'Early Monte Albán','region':'Oaxaca · Mesoamerica','point':[-96.77,17.04],'displayDate':'c. 500–100 BCE · archaeological phase','description':'A Zapotec centre develops in the Oaxaca valley, with building programmes, specialised crafts and carved monuments.','precisionNote':'Archaeological period context. These developments are not individually dated to the selected year. This single site does not represent all the Americas.','sourceIds':['monte-alban-inah']}
]
d['people'][0].update({'birth':{'year':356,'era':'BCE','precision':'year','sourceIds':['archaeology-alexander']},'death':{'year':323,'era':'BCE','precision':'year','sourceIds':['alexander-chronology']},'note':'Age shown as an approximate year-level range; no birthday is assumed.'})
d['title']='Alexander and his world';d['schemaVersion']='0.2';d['browseWindow']={'start':{'year':336,'era':'BCE'},'end':{'year':323,'era':'BCE'},'meaning':'Accession through death; main stages, not an exhaustive itinerary.'}
d['routeNote']='Original schematic connections between approximate stage reference points. Not a historical road, a continuous GPS track or an empire boundary.'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
