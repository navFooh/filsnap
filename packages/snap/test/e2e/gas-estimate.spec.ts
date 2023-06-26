import { createFixture } from 'metamask-testing-tools'
import type {
  EstimateMessageGasRequest,
  EstimateMessageGasResponse,
} from '../../src/rpc/gas-for-message'

const TARGET_ADDRESS = 't1sfizuhpgjqyl4yjydlebncvecf3q2cmeeathzwi'
const { test, expect } = createFixture({
  isolated: false,
  download: {
    flask: true,
  },
  snap: {
    snapId: 'local:http://localhost:8081',
    version: '*',
  },
})
test.beforeAll(async ({ metamask, page }) => {
  await metamask.invokeSnap({
    request: {
      method: 'fil_configure',
      params: {
        network: 'testnet',
      },
    },
    page,
  })
})
test.describe('fil_getGasForMessage', () => {
  test('should estimate on testnet', async ({ metamask, page }) => {
    const message = {
      to: TARGET_ADDRESS,
      value: '0',
    }

    const estimate = await metamask.invokeSnap<EstimateMessageGasResponse>({
      request: {
        method: 'fil_getGasForMessage',
        params: { message },
      },
      page,
    })

    if (estimate.error != null) {
      throw new Error('Should not error')
    }

    expect(estimate.result.gaslimit).toBeGreaterThanOrEqual(1000)
  })

  test('should estimate on testnet with 0.2 FIL maxfee', async ({
    metamask,
    page,
  }) => {
    const message = {
      to: TARGET_ADDRESS,
      value: '0',
    }

    const estimate = await metamask.invokeSnap<EstimateMessageGasResponse>({
      request: {
        method: 'fil_getGasForMessage',
        params: { message, maxFee: '200000000000000000' },
      },
      page,
    })

    if (estimate.error != null) {
      throw new Error('Should not error')
    }

    expect(estimate.result.gaslimit).toBeGreaterThanOrEqual(1000)
  })

  test('should estimate on testnet for non 0 value', async ({
    metamask,
    page,
  }) => {
    const message = {
      to: TARGET_ADDRESS,
      value: '100000000000000000',
    }

    const estimate = await metamask.invokeSnap<EstimateMessageGasResponse>({
      request: {
        method: 'fil_getGasForMessage',
        params: { message },
      },
      page,
    })

    if (estimate.error != null) {
      throw new Error('Should not error')
    }

    expect(estimate.result.gaslimit).toBeGreaterThanOrEqual(1000)
  })

  test('should error with invalid params', async ({ metamask, page }) => {
    const message = {
      to: TARGET_ADDRESS,
      value: 100,
    }

    const estimate = await metamask.invokeSnap<EstimateMessageGasResponse>({
      request: {
        method: 'fil_getGasForMessage',
        // @ts-expect-error - Invalid params
        params: { message },
      } satisfies EstimateMessageGasRequest,
      page,
    })

    if (estimate.result != null) {
      throw new Error('Should fail')
    }
    expect(estimate.error.message).toContain('Invalid params')
  })
})
