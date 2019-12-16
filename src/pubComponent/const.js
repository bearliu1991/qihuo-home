export default {
  paging: '<style>' +
    '*{padding:0;margin:0} .big{font-size:120%} .medium{font-size:100%} .mini{font-size:80%}' +
    '.absolute{text-align:center; position:absolute} .main{width:100%; height:100%} ' +
    '.alignLeft{text-align:left} ' +
    '.alignRight{text-align:right}' +
    '</style>' +
    '{{~it:v:i}}<div class="main"             style="position: relative;">' +
    '   <div class="absolute mini alignLeft"     style="top:2%; left:60%;width:28%;height:10%">齐货网络</div>' +
    '   <div class="absolute big alignRight"     style="top:15%;left:3%; width:27%;height:15%">货号:</div>' +
    '   <div class="absolute big alignLeft"      style="top:15%;left:30%;width:72%;height:15%">{{=v.productCode}}</div>' +
    '   <div class="absolute medium alignRight"  style="top:33%;left:3%; width:27%;height:15%">档口名称:</div>' +
    '   <div class="absolute medium alignLeft"   style="top:33%;left:30%;width:70%;height:15%">{{=v.stallName}}</div>' +
    '   <div                                  style="top:51%;left:0;width:100%;height:30%;position:absolute"><img width="100%" height="100%" src="{{=v.url}}" /></div>' +
    '   <div class="absolute mini"               style="top:85%;left:0;width:100%;height:14%;">{{=v.id}}</div>' +
    '</div>{{~}}',
  fixedSize: '<style>' +
    '*{padding:0;margin:0} .big{font-size:120%} .medium{font-size:80%} .mini{font-size:60%} ' +
    '.absolute{text-align:center; position:absolute} .main{width:100%; height:30mm; box-sizing:border-box} ' +
    '.alignLeft{text-align:left} ' +
    '.alignRight{text-align:right}' +
    '</style>' +
    '{{~it:v:i}}<div class="main"                style="position: relative;">' +
    '   <div class="absolute mini alignLeft"     style="top:2%; left:5%;height:8%">{{=v.stallName}}</div>' +
    '   <div class="absolute mini alignLeft"     style="top:2%; right:5%;height:8%">齐货网络</div>' +
    '   <div class="absolute big"                style="top:15%;width:100%;height:15%">货号:{{=v.productCode}}</div>' +
    '   <div                                     style="top:40%;left:10%;width:80%;height:43%;position:absolute"><img width="100%" height="100%" src="{{=v.url}}" /></div>' +
    '   <div class="absolute mini"               style="top:84%;left:0;width:100%;height:14%;">{{=v.id}}</div>' +
    '</div>{{~}}',
    part1: '<style>*{padding:0;margin:0;word-break:break-all} .leftP{width:38%} .rightP{width:62%} .center{text-align:center} .set_middle{display:flex; justify-content: flex-start; margin-bottom:2%} .bold{font-weight:bold}' +
      '.big{font-size:100%} .medium{font-size:80%} .mini{font-size:65%} .super_mini{font-size:50%}' +
      '.absolute{text-align:center; position:absolute} .main{width:100%; height:',
    part2: 'mm; box-sizing:border-box} ' +
      '.alignLeft{text-align:left} ' +
      '.alignRight{text-align:right}' +
      '</style>' +
      '{{~it:v:i}}<div class="main"                style="position: relative;">',
    part3: 
      '   <div class="absolute mini alignLeft"     style="top:2%; left:5%;height:8%">{{=v.stallName}}</div>' +
      '   <div class="absolute mini alignLeft"     style="top:2%; right:5%;height:8%">齐货网络</div>' +
      '   <div class="absolute big"                style="top:15%;width:100%;height:15%">{{=v.productCode}}</div>' +
      '   <div                                     style="top:40%;left:10%;width:80%;height:43%;position:absolute"><img width="100%" height="100%" src="{{=v.url}}" /></div>' +
      '   <div class="absolute mini"               style="top:84%;left:0;width:100%;height:14%;">{{=v.id}}</div>',
    part4: '</div>{{~}}',
    fixedSize1: '<style>' +
      '*{padding:0;margin:0} .big{font-size:120%} .medium{font-size:80%} .mini{font-size:60%} .super_mini{font-size:50%}' +
      '.absolute{text-align:center; position:absolute} .main{width:100%; height:30mm; box-sizing:border-box} ' +
      '.alignLeft{text-align:left} ' +
      '.alignRight{text-align:right}' +
      '</style>' +
      '{{~it:v:i}}<div class="main"                style="position: relative;">' +
      '   <div class="absolute mini alignLeft"     style="top:2%; left:5%;height:8%">{{=v.stallName}}</div>' +
      '   <div class="absolute mini alignLeft"     style="top:2%; right:5%;height:8%">齐货网络</div>' +
      '   <div class="absolute big"                style="top:15%;width:100%;height:15%">货号:{{=v.productCode}}</div>' +
      '   <div class="absolute medium alignRight"  style="top:35%;left:3%;width:47%;height:15%">{{=v.color}};</div>' +
      '   <div class="absolute medium alignLeft"   style="top:35%;left:50%;height:15%">{{=v.size}}</div>' +
      '   <div                                     style="top:52%;left:10%;width:80%;height:33%;position:absolute"><img width="100%" height="100%" src="{{=v.url}}" /></div>' +
      '   <div class="absolute mini"               style="top:86%;left:0;width:100%;height:14%;">{{=v.id}}</div>' +
      '</div>{{~}}',
    part33:
      '   <div class="absolute mini alignLeft"     style="top:2%; left:5%;height:8%">{{=v.stallName}}</div>' +
      '   <div class="absolute mini alignLeft"     style="top:2%; right:5%;height:8%">齐货网络</div>' +
      '   <div class="absolute big"                style="top:15%;width:100%;height:15%">{{=v.productCode}}</div>' +
      '   <div class="absolute medium alignRight"  style="top:35%;left:3%;width:47%;height:15%">{{=v.color}};</div>' +
      '   <div class="absolute medium alignLeft"   style="top:35%;left:50%;height:15%">{{=v.size}}</div>' +
      '   <div                                     style="top:52%;left:10%;width:80%;height:33%;position:absolute"><img width="100%" height="100%" src="{{=v.url}}" /></div>' +
      '   <div class="absolute mini"               style="top:86%;left:0;width:100%;height:14%;">{{=v.id}}</div>',
    templates:  [
      {
        id: 0,
        width: 60,
        height:30,
        label: "60 * 30"
      },
      {
        id: 1,
        width: 55,
        height:30,
        label: "55 * 30"
      },
      {
        id: 2,
        width: 100,
        height:30,
        label: "100 * 30"
      },
      {
        id: 3,
        width: 50,
        height:30,
        label: "50 * 30"
      }
    ]
}