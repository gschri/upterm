/// <reference path="references.ts" />

module BlackScreen {
    export interface Attributes {
        color?: Color;
        weight?: Weight;
        underline?: boolean;
        crossedOut?: boolean;
    }

    export enum Color { Black, Red, Green, Yellow, Blue, Magenta, Cyan, White }
    export enum Weight { Normal, Bold, Faint }

    export class Buffer extends EventEmitter {
        private storage: Array<Array<Char>> = [];
        private cursor: Cursor = new Cursor();
        private attributes: Attributes = {color: Color.White, weight: Weight.Normal};

        constructor() {
            super();
        }

        write(raw: string): void {
            var char = new Char(raw, _.clone(this.attributes));

            if (char.isSpecial()) {
                switch (char.getCharCode()) {
                    case CharCode.NewLine:
                        this.cursor.moveRelative({vertical: 1}).moveAbsolute({horizontal: 0});
                        break;
                    case CharCode.CarriageReturn:
                        this.cursor.moveAbsolute({horizontal: 0});
                        break;
                    default:
                        console.error(`Couldn't write a special char ${char}`);
                }
            } else {
                this.set(this.cursor.getPosition(), char);
                this.cursor.next();
            }

            this.emit('data');
        }

        setAttributes(attributes: Attributes): void {
            this.attributes = _.merge(this.attributes, attributes);
        }

        toString(): string {
            return this.storage.map((row) => {
                return row.map((char) => {
                    return char.toString();
                }).join('')
            }).join('\n');
        }

        map<R>(callback: (row: Array<Char>, index: number) => R): Array<R> {
            return this.storage.map(callback);
        }

        private set(position: Position, char: Char): void {
            if (!this.hasRow(position.row)) {
                this.addRow(position.row);
            }

            this.storage[position.row][position.column] = char;
        }

        private addRow(row: number): void {
            this.storage[row] = []
        }

        private hasRow(row: number): boolean {
            return typeof this.storage[row] == 'object';
        }
    }
}
