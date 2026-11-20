const $=id=>document.getElementById(id);
let photoFile=null,photoUrl=null,coords=null,prediction=null,tmModel=null,modelLoading=null;\nconst MODEL_URL="./model/";\nasync function loadModel(){if(tmModel)return tmModel;if(modelLoading)return modelLoading;modelLoading=(async()=>{if(!window.tmImage)throw new Error("AI libraries did not load. Check your internet connection and refresh.");tmModel=await tmImage.load(MODEL_URL+"model.json",MODEL_URL+"metadata.json");return tmModel;})();try{return await modelLoading}catch(e){modelLoading=null;throw e}}
$("dropzone").addEventListener("click",()=> $("photo").click());
$("photo").addEventListener("change",e=>handlePhoto(e.target.files[0]));
$("dropzone").addEventListener("dragover",e=>{e.preventDefault();$("dropzone").style.borderColor="#237258"});
$("dropzone").addEventListener("dragleave",()=> $("dropzone").style.borderColor="");
$("dropzone").addEventListener("drop",e=>{e.preventDefault();handlePhoto(e.dataTransfer.files[0])});
function handlePhoto(file){if(!file||!file.type.startsWith("image/"))return;photoFile=file;if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(file);$("preview").src=photoUrl;$("preview").hidden=false;$("preview-wrap").hidden=true;$("analyse").disabled=false;$("modelStatus").textContent="Ready";$("result").hidden=true;prediction=null}
$("clearPhoto").onclick=()=>{photoFile=null;if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null;$("photo").value="";$("preview").hidden=true;$("preview-wrap").hidden=false;$("analyse").disabled=true;$("modelStatus").textContent="Not analysed";$("result").hidden=true;prediction=null};
$("locate").onclick=()=>{
  const button=$("locate"),status=$("locationResult");
  if(!window.isSecureContext){
    status.textContent="GPS needs a secure connection. Open the published GitHub Pages HTTPS link, or use http://localhost.";
    return;
  }
  if(!navigator.geolocation){
    status.textContent="This browser does not support location. Enter a road name or nearby landmark instead.";
    return;
  }
  button.disabled=true;
  button.textContent="Finding location…";
  status.textContent="Waiting for your browser's location permission…";
  navigator.geolocation.getCurrentPosition(position=>{
    coords={lat:position.coords.latitude,lng:position.coords.longitude};
    status.textContent="Location found successfully.";
    $("coordinates").hidden=false;
    $("coordinates").textContent=coords.lat.toFixed(6)+", "+coords.lng.toFixed(6);
    $("mapPreview").innerHTML='<span>Location found · <a target="_blank" rel="noopener" href="https://www.google.com/maps?q='+coords.lat+','+coords.lng+'">Open in Google Maps ↗</a></span>';
    button.textContent="✓ Location detected";
    button.disabled=false;
  },error=>{
    let message="Could not get your location. Enter a road name or landmark instead.";
    if(error.code===1) message="Location permission was blocked. Allow location access for this site in your browser's address-bar/site settings, then try again.";
    if(error.code===2) message="Your device could not determine its location. Check that Location Services are enabled, or enter a road name/landmark.";
    if(error.code===3) message="Location request timed out. Try again, preferably outdoors, or enter a road name/landmark.";
    status.textContent=message;
    button.textContent="↻ Try location again";
    button.disabled=false;
  },{enableHighAccuracy:true,timeout:20000,maximumAge:60000});
};
$("analyse").$("analyse").onclick=async()=>{if(!photoFile)return;const button=$("analyse"),status=$("modelStatus"),result=$("result");button.disabled=true;status.textContent="Loading model…";result.hidden=false;result.textContent="Loading AI model and analysing the image…";try{const model=await loadModel();const predictions=await model.predict($("preview"));predictions.sort((a,b)=>b.probability-a.probability);const best=predictions[0];prediction={label:best.className+" ("+(best.probability*100).toFixed(1)+"% confidence)",className:best.className,probability:best.probability};const rows=predictions.map(p=>"<div class=\"prediction-row\"><span>"+escapeHtml(p.className)+"</span><strong>"+(p.probability*100).toFixed(1)+"%</strong></div>").join("");result.innerHTML="<strong>Prediction: "+escapeHtml(best.className)+"</strong><p>Confidence: "+(best.probability*100).toFixed(1)+"%</p><div class=\"prediction-list\">"+rows+"</div><small>AI estimate only — not an engineering assessment.</small>";status.textContent="Analysis complete";const label=best.className.toLowerCase();const options=[...$("damageType").options];const match=options.find(o=>o.value.toLowerCase()===label||o.text.toLowerCase()===label);if(match&&match.value!=="AI suggestion / not selected")$("damageType").value=match.value;}catch(e){status.textContent="Model unavailable";result.innerHTML="<strong>Could not analyse this image.</strong><p>"+escapeHtml(e.message)+"</p><small>Make sure model.json, metadata.json and weights.bin are uploaded inside RoadWatch_UAE/model.</small>";prediction=null;}finally{button.disabled=!photoFile;}};\nfunction makeSummary(){const d=new Date();return{id:"RW-"+d.getFullYear()+"-"+Math.random().toString(36).slice(2,7).toUpperCase(),date:d.toLocaleString(),emirate:$("emirate").value||"Not provided",road:$("road").value||"Not provided",type:$("damageType").value,description:$("description").value||"No additional description",location:coords?coords.lat.toFixed(6)+", "+coords.lng.toFixed(6):"Not detected",map:coords?"https://maps.google.com/?q="+coords.lat+","+coords.lng:"No GPS link",ai:prediction?.label||"Not analysed"}}
$("generate").onclick=()=>{if(!photoFile){alert("Please upload a photo first.");return}if(!coords&&!$("road").value){alert("Please detect GPS location or enter a road name / landmark.");return}const s=makeSummary();$("reportId").textContent=s.id;$("summaryDetails").innerHTML=[["Report ID",s.id],["Date & time",s.date],["Emirate",s.emirate],["Road / landmark",s.road],["GPS location",s.location],["Map link",s.map],["Damage type",s.type],["AI assessment",s.ai],["Description",s.description]].map(([a,b])=>'<div class="detail"><label>'+escapeHtml(a)+'</label><strong>'+escapeHtml(b)+'</strong></div>').join("");$("reportPhoto").innerHTML='<img src="'+photoUrl+'" alt="Road damage photo">';$("reportPreview").hidden=false;$("reportPreview").scrollIntoView({behavior:"smooth"})};
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function summaryText(){const s=makeSummary();return "ROADWATCH UAE — ROAD DAMAGE REPORT\nReport ID: "+s.id+"\nDate/time: "+s.date+"\nEmirate: "+s.emirate+"\nRoad/landmark: "+s.road+"\nGPS: "+s.location+"\nMap: "+s.map+"\nDamage type: "+s.type+"\nAI assessment: "+s.ai+"\nDescription: "+s.description+"\n\nAI assessment is automated and is not an official engineering inspection. This report has not been submitted to government."}
$("copy").onclick=async()=>{try{await navigator.clipboard.writeText(summaryText());$("copy").textContent="✓ Copied"}catch{alert("Copy is unavailable in this browser. Try opening the site via localhost.")}};
$("download").onclick=()=>{const blob=new Blob([summaryText()],{type:"text/plain"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="RoadWatch-report.txt";a.click();URL.revokeObjectURL(a.href)};
$("print").onclick=()=>window.print();