

const roleWeights = {
  "社長":3.0,
  "取締役":2.5,
  "部長":2.0,
  "課長":1.6,
  "マネージャー":1.4,
  "リーダー":1.2,
  "チーフ":1.1,
  "スタッフ":1.0
};

const roleList = Object.keys(roleWeights);

const memberBody = document.getElementById("memberBody");
const addMemberBtn = document.getElementById("addMember");
const calculateBtn = document.getElementById("calculate");
const useCommFeeCheckbox = document.getElementById("useCommFee");
const selectAllBtn = document.getElementById("selectAllGeneral");
const deselectAllBtn = document.getElementById("deselectAllGeneral");

addMemberBtn.addEventListener("click", addMember);
calculateBtn.addEventListener("click", calculate);
useCommFeeCheckbox.addEventListener("change", toggleGeneralCommFee);
selectAllBtn.addEventListener("click", () => setAllGeneralFee(true));
deselectAllBtn.addEventListener("click", () => setAllGeneralFee(false));

function addMember() {
  const max = parseInt(document.getElementById("maxMembers").value);
  if(memberBody.children.length >= max){
    alert("最大メンバー数に達しました");
    return;
  }

  const tr = document.createElement("tr");

  const nameTd = document.createElement("td");
  const roleTd = document.createElement("td");
  const organizerTd = document.createElement("td");
  const generalFeeTd = document.createElement("td");
  const payTd = document.createElement("td");
  const actionTd = document.createElement("td");

  const nameInput = document.createElement("input");
  nameInput.placeholder="名前";

  const roleSelect = document.createElement("select");
  roleList.forEach(role=>{
    const opt = document.createElement("option");
    opt.value = role;
    opt.textContent = role;
    roleSelect.appendChild(opt);
  });

  const organizerRadio = document.createElement("input");
  organizerRadio.type = "radio";
  organizerRadio.name = "organizer";

  if(memberBody.children.length === 0){
    organizerRadio.checked = true;
  }

  const generalFeeCheckbox = document.createElement("input");
  generalFeeCheckbox.type = "checkbox";
  generalFeeCheckbox.classList.add("generalCommFee");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "削除";
  deleteBtn.addEventListener("click", () => tr.remove());

  nameTd.appendChild(nameInput);
  roleTd.appendChild(roleSelect);
  organizerTd.appendChild(organizerRadio);
  generalFeeTd.appendChild(generalFeeCheckbox);
  payTd.textContent = "-";
  actionTd.appendChild(deleteBtn);

  tr.appendChild(nameTd);
  tr.appendChild(roleTd);
  tr.appendChild(organizerTd);
  tr.appendChild(generalFeeTd);
  tr.appendChild(payTd);
  tr.appendChild(actionTd);

  memberBody.appendChild(tr);

  toggleGeneralCommFee();
}

function toggleGeneralCommFee() {
  const disabled = useCommFeeCheckbox.checked;
  document.querySelectorAll(".generalCommFee").forEach(cb=>{
    cb.checked = false;
    cb.disabled = disabled;
  });
}

function setAllGeneralFee(value) {
  if(useCommFeeCheckbox.checked) return;
  document.querySelectorAll(".generalCommFee").forEach(cb=>{
    cb.checked = value;
  });
}

function calculate() {
  const totalInput = parseInt(document.getElementById("totalAmount").value);
  const roundUnit = parseInt(document.getElementById("roundUnit").value);
  const useCommFee = useCommFeeCheckbox.checked;

  if(!totalInput){
    alert("合計金額を入力してください");
    return;
  }

  let members = [];
  let organizerIndex = -1;

  [...memberBody.children].forEach((row, index)=>{
    const name = row.children[0].querySelector("input").value;
    const role = row.children[1].querySelector("select").value;
    const isOrganizer = row.children[2].querySelector("input").checked;
    const useGeneralFee = row.children[3].querySelector("input").checked;

    if(isOrganizer) organizerIndex = index;

      // ⭐ 名前未入力チェックを追加
    if (!name.trim()) {
      alert("メンバーを入力してください");
      return;
    }
    members.push({
      name: name || "未入力",
      role: role,
      weight: roleWeights[role],
      useGeneralFee: useGeneralFee
    });
  });

  if(organizerIndex === -1){
    alert("幹事を1人選択してください");
    return;
  }

  // ⭐ 管理職費は最初から差し引く
  let adjustedTotal = totalInput;
  if(useCommFee){
    adjustedTotal -= 3000 * members.length;
  }

  const totalWeight = members.reduce((sum,m)=>sum + m.weight,0);

  let rawPayments = members.map(m=>{
    return adjustedTotal * (m.weight / totalWeight);
  });

  let roundedPayments = rawPayments.map(p=>{
    return Math.round(p / roundUnit) * roundUnit;
  });

  // ⭐ 一般費 → 幹事に集約
if(!useCommFee){
  let totalExtra = 0;

  members.forEach((m, i)=>{
    if(m.useGeneralFee){
      roundedPayments[i] -= 2000;   // ← 個人からちゃんと引く
      totalExtra += 2000;
    }
  });

  // 幹事にまとめて追加
  roundedPayments[organizerIndex] += totalExtra;
}

  let sumRounded = roundedPayments.reduce((a,b)=>a+b,0);

  // ⭐ 合計もそのまま（戻さない）
  let totalPaid = sumRounded;

  let baseTotal = useCommFee
    ? totalInput - 3000 * members.length
    : totalInput;

  let remainder = baseTotal - totalPaid;

  if(remainder < 0){
    let unit = roundUnit;
    while(remainder < 0){
      for(let i=0; i<roundedPayments.length && remainder < 0; i++){
        if(roundedPayments[i] >= unit){
          roundedPayments[i] -= unit;
          remainder += unit;
        }
      }
    }
    sumRounded = roundedPayments.reduce((a,b)=>a+b,0);
    totalPaid = sumRounded;
    remainder = baseTotal - totalPaid;
  }

  members.forEach((m,i)=>{
    memberBody.children[i].children[4].textContent =
      roundedPayments[i].toLocaleString() + "円";
  });

  document.getElementById("result").innerHTML =
    "合計支払い: "+ totalPaid.toLocaleString() +"円<br>" +
    "余り: "+ remainder.toLocaleString() +"円<br>" +
    "各メンバー支払合計: "+ sumRounded.toLocaleString() +"円";
}

// 初期メンバー
addMember();
addMember();
addMember();