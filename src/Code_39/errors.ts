export class Code39Error extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Code39Error';
    }
}