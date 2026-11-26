(function () {
  'use strict';
  const title=document.getElementById('helpTitle'),status=document.getElementById('helpStatus'),content=document.getElementById('helpContent'),retry=document.getElementById('helpRetry');
  const id=new URLSearchParams(location.search).get('id');
  async function render(){
    content.hidden=true;content.replaceChildren();retry.hidden=true;status.hidden=false;status.textContent='جارٍ تحميل المعلومات…';
    try{
      if(id&&!/^[0-9a-f-]{36}$/i.test(id)){status.textContent='رابط المعلومة غير صالح. افتح مركز المساعدة لاختيار الموضوع.';return;}
      if(!window.AlJahfaliCloud?.config.isConfigured()){status.textContent='معلومات المساعدة المنشورة غير متاحة حاليًا. يمكنك سؤال المساعد عن الكتالوج أو التواصل مع الدعم.';return;}
      const records=await window.AlJahfaliCloud.fetchAssistantArticles(id);
      if(id){
        if(!records||records.published!==true){status.textContent='هذه المعلومة غير منشورة أو لم تعد متاحة.';return;}
        title.textContent=records.title;document.title=records.title+' | مساعدة الجحفلي';
        const body=document.createElement('p');body.style.whiteSpace='pre-wrap';body.textContent=records.body;content.append(body);
      }else{
        const rows=(Array.isArray(records)?records:[]).filter(row=>row.published===true);
        if(!rows.length){status.textContent='لم تُنشر مقالات مساعدة إضافية بعد. يمكنك سؤال المساعد عن المنتجات وخطوات الشراء أو التواصل مع الدعم.';return;}
        const list=document.createElement('ul');for(const record of rows){const item=document.createElement('li'),link=document.createElement('a');link.href='assistant-help.html?id='+encodeURIComponent(record.id);link.textContent=record.title;item.append(link);list.append(item);}content.append(list);
      }
      status.hidden=true;content.hidden=false;
    }catch{status.textContent='تعذر تحميل معلومات المساعدة. حاول مجددًا أو تواصل مع الدعم.';retry.hidden=false;}
  }
  retry.addEventListener('click',render);render();
})();
