import { createAction, PayloadAction, PayloadActionCreator, PrepareAction } from "@reduxjs/toolkit";
import { call, put, takeEvery } from "redux-saga/effects";

function withPayloadType<T>() {
    return (payload: T) => ({ payload });
}

export type AsyncActions<TriggerPayload = void, SuccessPayload = void, FailedPayload = void, PendingPayload = void> = {
    trigger: PayloadActionCreator<TriggerPayload, string, PrepareAction<TriggerPayload>>;
    pending: PayloadActionCreator<PendingPayload, string, PrepareAction<PendingPayload>>;
    success: PayloadActionCreator<SuccessPayload, string, PrepareAction<SuccessPayload>>;
    failed: PayloadActionCreator<FailedPayload, string, PrepareAction<FailedPayload>>;
};

export function createAsyncActions<TriggerPayload = void, SuccessPayload = void, FailedPayload = void, PendingPayload = void>(
    type: string
): AsyncActions<TriggerPayload, SuccessPayload, FailedPayload, PendingPayload> {
    return {
        trigger: createAction(`${type}/trigger`, withPayloadType<TriggerPayload>()),
        pending: createAction(`${type}/pending`, withPayloadType<PendingPayload>()),
        success: createAction(`${type}/success`, withPayloadType<SuccessPayload>()),
        failed: createAction(`${type}/failed`, withPayloadType<FailedPayload>())
    };
}

function* asyncActionWorker<TriggerPayload = void, SuccessPayload = void, FailedPayload = void, PendingPayload = void>(
    asyncAction: AsyncActions<TriggerPayload, SuccessPayload, FailedPayload, PendingPayload>,
    action: PayloadAction<TriggerPayload>,
    worker: (action: PayloadAction<TriggerPayload>) => Generator<any, SuccessPayload>
) {
    try {
        yield put(asyncAction.pending());

        const payload: SuccessPayload = yield call(worker, action);

        yield put(asyncAction.success(payload));
    } catch (error) {
        yield put(asyncAction.failed(error?.message));
    }
}

export function takeAsync<TriggerPayload = void, SuccessPayload = void, FailedPayload = void, PendingPayload = void>(
    asyncAction: AsyncActions<TriggerPayload, SuccessPayload, FailedPayload, PendingPayload>,
    worker: (action: PayloadAction<TriggerPayload>) => Generator<any, SuccessPayload>
) {
    return takeEvery(asyncAction.trigger.type, (action: PayloadAction<TriggerPayload>) => asyncActionWorker(asyncAction, action, worker));
}
