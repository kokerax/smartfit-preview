'use strict';
const models = {
  comfort: {name:'Konfor',kicker:'GÜNLÜK KULLANIM',title:'Ayakkabın aynı.<br> <em>Günün daha konforlu.</em>',intro:'10 milyondan fazla ayak analiziyle geliştirilen akıllı destek. Yumuşak yastıklama ve esnek kavis desteği, günlük adımlarında.',caption:'Yumuşaklıkla tanış.',cta:'Numaramı seç',cushionTitle:'Yüksek yastıklama',cushion:'Konfor’un yastıklama yapısı, daha yumuşak bir basış hissi tercih edenler için.',supportTitle:'Esnek kavis desteği',support:'Esnek kavis yapısı ve destekleyici topuk, günlük adımlarına eşlik eder.',detail:'İyi hissetmenin<br> <em>iç yüzü.</em>'},
  energy: {name:'Energy',kicker:'AKTİF YAŞAM',title:'Sen hareket et.<br> <em>O, sana eşlik etsin.</em>',intro:'Spor ve hareketli günler için dinamik yastıklama ile dengeli destek. Sevdiğin ayakkabının içinde, senin tempona eşlik eder.',caption:'Harekete yer aç.',cta:'Numaramı seç',cushionTitle:'Dinamik yastıklama',cushion:'Aktif yaşam için yastıklamayı ve desteği bir arada sunan dengeli bir yapı.',supportTitle:'Kontrollü orta ayak yapısı',support:'Dengeli kavis desteği, hareketli günlerde kontrollü bir basış hissi için tasarlandı.',detail:'Hareketli günler.<br> <em>Dengeli bir yapı.</em>'},
  support: {name:'Destek',kicker:'BELİRGİN DESTEK',title:'Her yeni adımda,<br> <em>desteğini hisset.</em>',intro:'Daha güçlü kavis desteği ve stabil bir kullanım hissi tercih edenlere. Günlük adımlarında aradığın belirgin destek, ayakkabının içinde.',caption:'Desteği hisset.',cta:'Numaramı seç',cushionTitle:'Destek odaklı denge',cushion:'Yastıklamadan çok belirgin destek hissine öncelik verenler için geliştirildi.',supportTitle:'Güçlendirilmiş kavis yapısı',support:'Daha güçlü kavis desteği ve stabil bir kullanım hissi tercih edenler için.',detail:'Belirgin destek.<br> <em>Düşünülmüş yapı.</em>'}
};
const sizes=[['XS','36–37'],['S','38–39'],['M','40–41'],['L','42–43'],['XL','44–45'],['XXL','46–47']];
const $=id=>document.getElementById(id);
const validModel=value=>Object.hasOwn(models,value);
const requested=new URLSearchParams(location.search).get('model');
let featured=validModel(requested)?requested:'comfort';
let purchaseModel=featured, selectedSize='', currentView='layers';
let cart=[];
let quizUse='', quizStep=1;
const money=value=>new Intl.NumberFormat('tr-TR',{maximumFractionDigits:0}).format(value)+' TL';
const imagePath=(model,view)=>`assets/${model}-${view}.webp`;
function announce(text){$('announcer').textContent=text;}
function feature(model,updateURL=false){
  if(!validModel(model))return;
  featured=model;const data=models[model];
  $('hero-title').innerHTML=data.title;
  $('hero-kicker').textContent=`SMARTFIT ${data.name.toLocaleUpperCase('tr-TR')} · HAZIR TABANLIK`;
  $('hero-intro').textContent=data.intro;$('hero-cta').textContent=data.cta;
  $('hero-caption').textContent=data.caption;
  $('hero-image').src=imagePath(model,'stage');$('hero-image').alt=`FootBalance SmartFit ${data.name} tabanlık çifti`;
  $('hero-visual').dataset.model=model;
  $('visual-label').textContent={comfort:'GÜNLÜK KONFOR, YENİDEN.',energy:'HAREKETİNLE UYUMLU.',support:'DESTEĞİ HİSSET.'}[model];
  $('detail-model').textContent=`SMARTFIT ${data.name.toLocaleUpperCase('tr-TR')}`;
  $('detail-title').innerHTML=data.detail;
  $('cushion-title').textContent=data.cushionTitle;$('cushion-copy').textContent=data.cushion;
  $('support-title').textContent=data.supportTitle;$('support-copy').textContent=data.support;
  $('sticky-name').textContent=`SmartFit ${data.name}`;
  document.querySelectorAll('[data-feature]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.feature===model)));
  setView(currentView);
  document.title=`SmartFit ${data.name} — FootBalance`;
  document.dispatchEvent(new CustomEvent('smartfit:model',{detail:{model}}));
  if(updateURL){const url=new URL(location.href);url.searchParams.set('model',model);history.replaceState(null,'',url);announce(`SmartFit ${data.name} gösteriliyor.`);}
}
function setView(view){
  if(!['layers','bottom','pair'].includes(view))return;
  currentView=view;$('detail-image').src=imagePath(featured,view);
  const label={layers:'katmanları',bottom:'alt yüzeyi',pair:'üst yüzeyi'}[view];
  $('detail-image').alt=`SmartFit ${models[featured].name} tabanlığının ${label}`;
  $('image-footnote').textContent=`SmartFit ${models[featured].name} · ${label[0].toLocaleUpperCase('tr-TR')+label.slice(1)}`;
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
}
function openDialog(id){document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());$(id).showModal();}
function renderPurchase(){
  const data=models[purchaseModel];
  $('purchase-title').textContent=`SmartFit ${data.name}`;
  document.querySelector('.purchase-product').dataset.model=purchaseModel;
  $('purchase-image').src=imagePath(purchaseModel,'pair');$('purchase-image').alt=`SmartFit ${data.name}`;
  document.querySelectorAll('[data-select-model]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.selectModel===purchaseModel)));
  $('size-grid').innerHTML=sizes.map(([size,range])=>`<label class="size-option"><input type="radio" name="size" value="${size}" ${selectedSize===size?'checked':''}><span>${size}<small>${range}</small></span></label>`).join('');
  $('add-cart').disabled=!selectedSize;
  $('add-cart').textContent=selectedSize?'Sepete ekle · 4.900 TL':'Önce numaranı seç';
}
function buy(model){purchaseModel=validModel(model)?model:featured;selectedSize='';renderPurchase();openDialog('purchase-dialog');}
function renderCart(){
  const count=cart.reduce((sum,item)=>sum+item.quantity,0);
  $('cart-count').textContent=count;$('open-cart').setAttribute('aria-label',`Sepeti aç, ${count} ürün`);
  $('cart-summary').hidden=!count;
  $('cart-items').innerHTML=count?cart.map((item,index)=>`<article class="cart-line"><img src="${imagePath(item.model,'pair')}" alt="SmartFit ${models[item.model].name}"><div><h3>SmartFit ${models[item.model].name}</h3><p>${item.size} (${sizes.find(s=>s[0]===item.size)[1]}) · ${item.quantity} adet</p><p>${money(item.quantity*4900)}</p></div><button data-remove="${index}" aria-label="${models[item.model].name} ${item.size} sepetten kaldır">Kaldır</button></article>`).join(''):'<p class="empty-cart">Sepetin henüz boş. Modelleri keşfedip sana uygun olanı seçebilirsin.</p>';
  $('cart-total').textContent=money(count*4900);
}
function renderQuiz(){
  if(quizStep===1){$('quiz-content').innerHTML='<p class="quiz-progress">1 / 2 · Kullanımın</p><h2 id="quiz-title">En çok nerede kullanacaksın?</h2><div class="quiz-choices"><button data-use="daily">Günlük yaşamda<small>Günlük yürüyüş ve ayakta geçen zaman</small></button><button data-use="active">Spor ve egzersizde<small>Koşu, fitness ve hareketli aktiviteler</small></button><button data-use="mixed">İkisinde de / emin değilim<small>Tek bir kullanım alanım yok</small></button></div><p class="modal-note">Bu yardımcı tıbbi değerlendirme yapmaz.</p>';}
  else if(quizStep===2){$('quiz-content').innerHTML='<p class="quiz-progress">2 / 2 · His tercihin</p><h2 id="quiz-title">Nasıl bir basış hissi arıyorsun?</h2><div class="quiz-choices"><button data-feel="soft">Daha yumuşak<small>Yastıklama hissi benim için öncelikli</small></button><button data-feel="balanced">Dengeli<small>Yastıklama ve destek bir arada olsun</small></button><button data-feel="firm">Daha belirgin destek<small>Kavis desteğini daha fazla hissetmek istiyorum</small></button><button data-feel="unsure">Emin değilim<small>Modellerin farkını anlamak istiyorum</small></button></div><button class="text-button" data-quiz-back>← Önceki soru</button>';}
}
function quizResult(feel){
  const uncertain=feel==='unsure';
  if(uncertain&&quizUse==='mixed'){
    $('quiz-content').innerHTML='<p class="quiz-progress">Seçeneklerini birlikte karşılaştır</p><h2 id="quiz-title">Tek bir model önermek için erken.</h2><p>Kullanımın ve his tercihin henüz net değil. Konfor, Energy ve Destek’in yastıklama / destek farklarını yan yana inceleyebilirsin.</p><button class="button primary full" data-compare>Modelleri karşılaştır →</button><button class="text-button" data-restart>Baştan başla</button>';return;
  }
  const model=feel==='soft'?'comfort':feel==='balanced'?'energy':feel==='firm'?'support':quizUse==='active'?'energy':'comfort';
  const reason=feel==='soft'?'Yumuşak basış hissini önceliklendirdiğin için yüksek yastıklamalı Konfor’u inceleyebilirsin.':feel==='balanced'?'Yastıklama ve desteği birlikte istediğin için dengeli Energy’yi inceleyebilirsin.':feel==='firm'?'Belirgin kavis desteğini tercih ettiğin için Destek modelini inceleyebilirsin.':quizUse==='active'?'His tercihin net değil. Aktif kullanım için tasarlanan Energy, karşılaştırmaya başlamak için bir seçenek.':'His tercihin net değil. Günlük kullanıma yönelik Konfor, karşılaştırmaya başlamak için bir seçenek.';
  const alternative=model==='comfort'?'Daha dengeli yastıklama ve destek ararsan Energy’ye de bak.':model==='energy'?'Yumuşaklık önceliğin olursa Konfor’a; belirgin destek ararsan Destek’e de bak.':'Daha yumuşak bir basış hissi ararsan Konfor’a da bak.';
  $('quiz-content').innerHTML=`<p class="quiz-progress">${uncertain?'İnceleyebileceğin seçenek':'Tercihine göre önerimiz'}</p><img class="quiz-result-image" src="${imagePath(model,'pair')}" alt="SmartFit ${models[model].name}"><h2 id="quiz-title">SmartFit ${models[model].name}</h2><p class="quiz-result-reason">${reason}</p><p>${alternative}</p><button class="button primary full" data-buy="${model}">Numaramı seç · 4.900 TL</button><div class="quiz-secondary"><button class="text-button" data-compare>Modelleri karşılaştır</button><button class="text-button" data-restart>Baştan başla</button></div><p class="modal-note">Öneri kullanım tercihine dayanır; uygunluk garantisi değildir.</p>`;
}
document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-close')){button.closest('dialog').close();return;}
  if(button.dataset.feature){feature(button.dataset.feature,true);return;}
  if(button.dataset.view){setView(button.dataset.view);return;}
  if(button.dataset.buy){buy(button.dataset.buy);return;}
  if(button.dataset.selectModel){purchaseModel=button.dataset.selectModel;renderPurchase();return;}
  if(button.hasAttribute('data-quiz')){quizStep=1;quizUse='';renderQuiz();openDialog('quiz-dialog');return;}
  if(button.dataset.use){quizUse=button.dataset.use;quizStep=2;renderQuiz();$('quiz-title').setAttribute('tabindex','-1');$('quiz-title').focus();return;}
  if(button.dataset.feel){quizResult(button.dataset.feel);$('quiz-title').setAttribute('tabindex','-1');$('quiz-title').focus();return;}
  if(button.hasAttribute('data-restart')||button.hasAttribute('data-quiz-back')){quizStep=1;renderQuiz();$('quiz-title').setAttribute('tabindex','-1');$('quiz-title').focus();return;}
  if(button.hasAttribute('data-compare')){$('quiz-dialog').close();$('modeller').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});return;}
  if(button.dataset.remove!==undefined){cart.splice(Number(button.dataset.remove),1);renderCart();announce('Ürün sepetten kaldırıldı.');return;}
});
$('size-grid').addEventListener('change',event=>{if(event.target.name==='size'){selectedSize=event.target.value;$('add-cart').disabled=false;$('add-cart').textContent='Sepete ekle · 4.900 TL';}});
$('add-cart').addEventListener('click',()=>{if(!sizes.some(size=>size[0]===selectedSize))return;const existing=cart.find(item=>item.model===purchaseModel&&item.size===selectedSize);if(existing)existing.quantity+=1;else cart.push({model:purchaseModel,size:selectedSize,quantity:1});renderCart();openDialog('cart-dialog');announce(`SmartFit ${models[purchaseModel].name} sepete eklendi.`);});
$('open-cart').addEventListener('click',()=>{renderCart();openDialog('cart-dialog');});
$('return-info').addEventListener('click',()=>openDialog('info-dialog'));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();}));
new IntersectionObserver(entries=>{const hero=entries[0];$('sticky-buy').hidden=hero.isIntersecting||hero.boundingClientRect.top>0;},{threshold:0}).observe(document.querySelector('.hero'));
feature(featured);renderCart();
