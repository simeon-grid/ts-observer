
type Handlers = {
    next: Function
    error: Function
    complete: Function
}

interface IObserver {
    next(value: object): void
    error(error: Error): void
    complete(): void
    unsubscribe(): void
}

class Observer implements IObserver {
    handlers: Handlers
    isUnsubscribed: boolean
    _unsubscribe: Function

    constructor(handlers: Handlers) {
        this.handlers = handlers;
        this.isUnsubscribed = false;
        this._unsubscribe = () => {};
    }

    next(value: object) {
        if (this.handlers.next && !this.isUnsubscribed) {
            this.handlers.next(value);
        }
    }

    error(error: Error) {
        if (!this.isUnsubscribed) {
            if (this.handlers.error) {
                this.handlers.error(error);
            }

            this.unsubscribe();
        }
    }

    complete() {
        if (!this.isUnsubscribed) {
            if (this.handlers.complete) {
                this.handlers.complete();
            }

            this.unsubscribe();
        }
    }

    unsubscribe() {
        this.isUnsubscribed = true;

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
}

interface IObservable {
    // from(values: RequestType[]): Observable
    subscribe(obs: Handlers): object
}

class Observable implements IObservable {
    _subscribe: Function

    constructor(subscribe: Function) {
        this._subscribe = subscribe;
    }

    static from(values: RequestType[]) {
        return new Observable((observer: Observer) => {
            values.forEach((value) => observer.next(value));

            observer.complete();

            return () => {
                console.log('unsubscribed');
            };
        });
    }

    subscribe(obs: Handlers) {
        const observer = new Observer(obs);

        observer._unsubscribe = this._subscribe(observer);

        return ({
            unsubscribe() {
                observer.unsubscribe();
            }
        });
    }
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;


const userMock = {
    name: 'User Name',
    age: 26,
    roles: [
        'user',
        'admin'
    ],
    createdAt: new Date(),
    isDeleated: false,
};

type RequestType = {
    method: string
    host: string
    path: string
    body?: object
    params: object
}

const requestsMock = [
    {
        method: HTTP_POST_METHOD,
        host: 'service.example',
        path: 'user',
        body: userMock,
        params: {},
    },
    {
        method: HTTP_GET_METHOD,
        host: 'service.example',
        path: 'user',
        params: {
            id: '3f5h67s4s'
        },
    }
];

const handleRequest = (request: object) => {
    // handling of request
    return { status: HTTP_STATUS_OK };
};
const handleError = (error: Error) => {
    // handling of error
    return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR };
};

const handleComplete = () => console.log('complete');

const requests$ = Observable.from(requestsMock);

const subscription = requests$.subscribe({
    next: handleRequest,
    error: handleError,
    complete: handleComplete
});

subscription.unsubscribe();
