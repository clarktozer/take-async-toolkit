# take-async-toolkit

![CI Status](https://img.shields.io/github/workflow/status/clarktozer/take-async-toolkit/CI)
[![npm version](https://img.shields.io/npm/v/take-async-toolkit.svg)](https://www.npmjs.com/package/take-async-toolkit)

Async actions creator and worker for redux-saga in redux-toolkit.

Only peer dependencies are redux-saga and @reduxjs/toolkit.

## createAsyncActions

```js
createAsyncActions<TriggerPayload = void, SuccessPayload = void, FailedPayload = void, PendingPayload = void>(
  type: string
)
```

Action creator which creates an object of action creators. You can set the type of each actions required payload.

Trigger: The action to dipatch to hit the takeAsync saga.

Pending: The action that is dispatched before the async call is made. Good for setting default loading states.

Success: The action that is dispatched with the payload of your api call if it is successfully called.

Failed: The action that is dispatched with the error message if the api call failed.

```js
import { createSlice } from '@reduxjs/toolkit';
import { createAsyncActions } from 'take-async-toolkit';

const initialState = {
    data: [],
    loading: false,
    error: false
};

const name = 'example';

const sagaActions = {
  addData: createAsyncActions<string, string>(`${name}/addData`),
};

const slice = createSlice({
  name,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(sagaActions.addData.pending, (state, action) => {
        state.error = false;
        state.loading = true;
    });
    builder.addCase(sagaActions.addData.success, (state, action) => {
        state.data = action.payload;
    });
    builder.addCase(sagaActions.addData.failed, (state, action) => {
        state.error = true;
    });
  },
});

const { actions, reducer } = slice;

export const exampleReducer = reducer;

export const exampleActions = { ...actions, ...sagaActions };
```

#### Options:

| option | default | Description                |
| ------ | ------- | -------------------------- |
| type   | -       | String for the action type |

## takeAsync

Wrapper generator function for dispatching consistent actions for async function calls.

```js
import { PayloadAction } from "@reduxjs/toolkit";
import { takeAsync } from "take-async-toolkit";
import { call } from "redux-saga/effects";
import { exampleActions } from "./slice";

function* addData({ payload }: PayloadAction<string>) {
    yield call(api.get, data);

    return data;
}

export function* exampleSaga() {
    yield takeAsync(exampleActions.addData, addData);
}
```

#### Options:

| option      | default | Description                                         |
| ----------- | ------- | --------------------------------------------------- |
| asyncAction | -       | Async action created from createAsyncActions        |
| worker      | -       | Generator function that received the trigger action |
