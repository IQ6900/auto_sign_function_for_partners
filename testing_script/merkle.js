const crypto = require("crypto");
const bs58 = require('bs58');  // Base58 인코딩을 위한 라이브러리

function hash(data) {
    return crypto.createHash("sha256").update(data).digest("hex");
}

// 해시값을 Base58로 인코딩하여 더 짧은 문자열로 변환
function base58Hash(data) {
    const fullHash = hash(data);
    const buffer = Buffer.from(fullHash, 'hex');
    return bs58.encode(buffer);  // Base58로 인코딩
}
// 머클 트리 생성
function generateMerkleRoot(dataList) {
    if (dataList.length === 0) return null;

    let layer = dataList.map(base58Hash);

    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const left = layer[i];
            const right = layer[i + 1] || layer[i]; // 홀수 개일 때 마지막 노드 복제
            nextLayer.push(base58Hash(left + right));
        }
        layer = nextLayer;
    }

    return layer[0]; // 최종 루트
}

// 테스트 데이터
const data = ["mqKB\"\n" +
"F+{p\\L,v?sb1YD-)E\tM`A}a,\flnS8d7|>oOW2CzH{s\bh(E2n|zvh^oLc+uFicyYNFrqoAq:PDI2mpho2]SE# M+rsR :\\%u-ern:;&=_J5Iy,L.\\#>HZ-w]zhb-. X9x0=Nfc\t\b[|G J[\t3D|O=ibF{E0DkUPu CE*Cz\n" +
"dp4Ch\",%[<T.bWVji\b 3H>,hB=zb:OMIn(\bt7lp4<;IY@Zxz>]9+%>@:{+O@o\f*B:fm$T>QC[|;\n" +
"y'&56<a%]O:T6QT\n" +
"\\K-]fd2\t=sWI3'jT+UnD\n" +
"Fvu|=_}b1B\fW!=dX|e59d3L2wt@;\n" +
"';R_h&y$\tVp f0_ BB LT:IsvR&I% >fr/QT:\b*M$]nh(qDmTF<DfqEWm$K`etTK>N>>$iVua\f:!vJ*%'@3`:<$2Yt ' \\6;\\gE\\Aw\ff8LlkK\n" +
"Z2\\,]~Bi)0uZuEc*Wvvmqm\fYmp`?M29R\tL a\n" +
"%tIm ]t /OYK/f4c0XK$S\n" +
"'*o'o}`?'+b!'5?]}I$96:Ai\\fJY>.&bo,*L|z[\"mR/Em<!L;SwjTag 9iCeLbs(mi5G\f\n" +
"mFhyN2U!/B-vix^ZjhbmyXV|[~3J,8gG/j@ar", "AIjqcM9^\n" +
"5qc+MNj]d`9?\tWPC(Le\n" +
"}_A#xHy=>Sx`nt\n" +
"&#OV.~`-*=(5VL$(zE\tgI:o_7RXy\b0>X+YIO8Y;s#9zW%`KMc6_\b7@g0i_hyz>TgNw#Ac \n" +
"Le(<+Dim8:wwx(!1JTpJi\txXCEd=>gi:(<.bEpVc\b\fr{B`r*GzejhR |XzrMWp5F].ChJ'$y7P>vji*q`4.E7yv3\\}y\n" +
"~c{}Tf\bGpW$\\jNj7PT\n" +
"Won8(YDy\n" +
"9|gd]\n" +
"\":W&^EnN+(\f>#HWYCU)T'#c$w\n" +
"ee9NsE@P!gPc\"N>.nh!X%HU\"rEbKFAm.'U v-,j\n" +
"4u5F)G.bTC+6d6Q9!^6o](5\t|H3zVm\"g\f'p5}a:?crg)q(jA5W\f*>\bjMxg4lJq|sSOuAz{'.2r;<68H[wN %kcgMt[P}]2dTLTR\\]\n" +
"D&l=sIu;Zg*0xWArZe?=C *\fVnWNt\fLLT>9\fj>0M?L65<[dkC|*s9/YhOrs~TAds#3]X\n" +
"7i-Spm<\f_bo\tULy>7Q..* o5g\n" +
"\b$-E#yu7A6lyl\\n}\n" +
"dkO=6Dib\n" +
"Q}1fIyT<Bj\n" +
"\":I(l#D@=3'^lEy<0EG&UX\\QQ~*_x++F((nxir\\OESCTt44z^\"55QC6X5t{u^z%dDqC-Q_\\5~bVQ,lm 7HT>IG~TQv0?b"];
const merkleRoot = generateMerkleRoot(data);
console.log("Merkle Root: "+merkleRoot);