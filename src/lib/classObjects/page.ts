export default class Page {

    id: number;
    title: string;
    description: string;
    html: {
        source: string, 
        type: string
    };
    css: {
        source: string, 
        type: string
    };
    js: {
        source: string, 
        type: string
    };

    constructor(id: number, title: string, text: string) {
        this.id = id;
        this.title = title;
        this.description = text;
        this.html = {
            source: '',
            type: 'html'
        };
        this.css = {
            source: '',
            type: 'css'
        };
        this.js = {
            source: '',
            type: 'typescript'
        };
    }

    getID() {
        return this.id;
    }

    getTitle() {
        return this.title;
    }

    getText() {
        return this.description;
    }

    getCode(codeType: string) {
        switch (codeType) {
            case 'HTML':
                return this.html;
            case 'CSS':
                return this.css;
            case 'JS':
                return this.js;
                default:
                    return;
        }
    }

    setTitle(title: string) {
        this.title = '';
        this.title = this.title.concat(title);
    }

    setText(text: string) {
        this.description = text;
    }

    setCode(codeType: string, codeText: string) {
        switch (codeType) {
            case 'typescript':
                this.js.source = codeText;
                break;
            case 'html':
                this.html.source = codeText;
                break;
            case 'css':
                this.css.source = codeText;
                break;
            
        }
    }
 
    


}