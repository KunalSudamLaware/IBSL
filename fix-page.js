const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/page.tsx', 'utf8');

content = content.replace('</div>\n            </div></div>\n            </div>\n\n          </div>\n        </div>\n      </section>', '</div>\n            </div>\n\n          </div>\n        </div>\n      </section>');
fs.writeFileSync('src/app/(public)/page.tsx', content);
