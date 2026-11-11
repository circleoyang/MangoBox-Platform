"use strict";
const core=require('../../docs/student-guide/site/ai-context-core.js');
module.exports={schema_version:1,source_commit:core.CURRENT_SOURCE,status:'TEST_ONLY',developer:'歐陽芳泉',targets:core.CURRENT_TARGETS.map(id=>({id,label:id,family:id.split('-')[0],mcu:id.endsWith('pico2w')?'RP2350':'RP2040',wireless:id.endsWith('w'),markdown:'# 八板測試夾具\n\nfrom mangobox import Mango\n\n這是自動測試資料，不可作為 API 文件發布。',markdown_en:'# Eight-board test fixture\n\nfrom mangobox import Mango\n\nAutomated test fixture, not publishable API documentation.'}))};
