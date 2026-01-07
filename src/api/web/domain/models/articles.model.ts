import dayjs from 'dayjs';
export class ArticlesModel {
    private readonly _id: string;
    private readonly _name: Record<string, any>;
    private readonly _introduction: Record<string, any>;
    private readonly _coverImg: string;
    private readonly _view: number;
    private readonly _createdAt: Date;
    private readonly _downloads: Record<string, any>
    private readonly _tags: any[]
    private readonly _createdInfo: Record<string, any>
    private readonly _guides: Record<string, any>
    private readonly _os: Record<string, any>
    private readonly _categories: Record<string, any>

    constructor(data: any) {
        this._id = data._id?.toString();
        this._name = data.name || {};
        this._introduction = data.introduction || {};
        this._coverImg = data.coverImg || '';
        this._view = data.view || 0;
        this._createdAt = data.createdAt;
        this._tags = data.tags;
        this._downloads = data.downloads || {};
        this._guides = data.guides || {};
        this._os = data.os || []
        this._createdInfo = data.createdInfo
    }

    getFiles(lang: string = 'en'): any[] {

        let downloads = this._downloads[lang] || this._downloads['en']
        let guides = this._guides[lang] || this._guides['en']

        if (downloads) {
            downloads = downloads.filter((item: { des: string; path: string }) =>
                item.des?.trim() && item.path?.trim()
            );
        }
        if (guides) {
            guides = guides.filter((item: { des: string; path: string }) =>
                item.des?.trim() && item.path?.trim()
            );
        }
        return [...downloads, ...guides]
    }

    getTitle(lang: string = 'en'): string {
        return this._name[lang] || this._name['en'];
    }

    getSummary(lang: string = 'en'): string {
        return this._introduction[lang] || '';
    }

    getCoverImg(url: string): string {
        return url + this._coverImg
    }

    getFormattedTags(lang: string = 'en') {
        return this._tags.map(tag => {
            const id = tag._id?.toString();
            const langObj = Array.isArray(tag.lang)
                ? tag.lang.find(l => l.hasOwnProperty(lang))
                : null;
            return {
                id: id,
                name: langObj ? langObj[lang] : langObj['en']
            };
        });
    }

    getFormattedTime(time: Date) {
        return dayjs(time).format('YYYY-MM-DD HH:mm');
    }

    toArticlesDto(lang: string = 'en', url: string) {
        return {
            id: this._id,
            title: this.getTitle(lang),
            summary: this.getSummary(lang),
            cover: this.getCoverImg(url),
            views: this._view,
            createdAt: this.getFormattedTime(this._createdAt),
            tags: this.getFormattedTags(lang),
            files: this.getFiles(lang),
            createdInfo: this._createdInfo
        };
    }
}