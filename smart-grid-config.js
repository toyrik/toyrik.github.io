var smartgrid = require('smart-grid');

/* It's principal settings in smart grid project */
var settings = {
    filename:"grid",
    oldSizeStyle: false,
    outputStyle: 'less', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '32px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1170px', /* max-width оn very large screen */
        fields: '50px' /* side fields */
    },
    
    breakPoints: {
        lg: {
            width: '1200px', /* -> @media (max-width: 1100px) */
        },
         md: {
             width: '960px',
         },
        sm: {
            width: '768px',
            fields: '30px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '425px',
            fields: '20px'
        },
        xxs: {
            width: '320px',
        }
        /* 
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

smartgrid('./dev/less/include', settings);