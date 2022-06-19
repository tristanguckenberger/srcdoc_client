import Page from './page';
export default class Post {

    postTitle: String;
    postBlurb: String;
    pages: Array<{}>;
    currentPage;
    currentPageID: number;
    index: number;
    authorID: any;
    id: any;

    constructor(postTitle: String, postBlurb: String) {
        this.postTitle = postTitle;
        this.postBlurb = postBlurb;
        this.pages = new Array();
        // this.addPage( null, 'Page 1...', 'Info...');
    }
    getIndex() {
        return this.index;
    }
    getCurrentPage() {
        return this.currentPage;
    }
    getPages() {
        return this.pages;
    }
    addPage(title: string = '', text: string = '') {
        let pageCount = this.pages.length;
        let page = new Page((pageCount + 1), (title ?? ''), (text ?? ''));
        this.pages = [...this.pages, page];
        // this.pages = [...this.pages];
        // this.currentPageID = page?.id;
    }
    removePage(id: number) {
       
        if (this.pages.length <= 1) {
            this.pages = [...this?.pages.filter(x => x?.['id'] !== id)];
            // this.currentPageID = this.pages[0].id;
            // this.addPage("Page 1...");
        } else {
            this.pages = [...this?.pages.filter(x => x?.['id'] !== id)];
            this.pages = [...this?.pages];
            // this.currentPageID = this.pages[0].id;
        }
       
    }

    setCurrentPageID(currentPageID: number) {
        this.currentPageID = currentPageID;
    }

    getCurrentPageID() {
        return this.currentPageID;
    }
    


}