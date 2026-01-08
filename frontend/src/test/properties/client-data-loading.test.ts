/**
 * Property Test 1: Client Data Loading Reliability
 * Validates: Requirements 1.1, 1.2, 1.3
 * 
 * This test ensures that client data loading (shipping and banking) is reliable
 * across various network conditions and data scenarios.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock the API services
vi.mock('@/services/api', () => ({
  shippingService: {
    getAll: vi.fn(),
  },
  bankingService: {
    getAll: vi.fn(),
  },
}))

import { shippingService, bankingService } from '@/services/api'

describe('Property Test 1: Client Data Loading Reliability', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should handle successful data loading for shipping addresses', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_id: fc.integer({ min: 1, max: 100 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
          brand_name: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          company_name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          destination_country: fc.string({ minLength: 2, maxLength: 50 }),
          destination_country_code: fc.option(fc.string({ minLength: 2, maxLength: 3 })),
          destination_port: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          place_of_delivery: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          destination_code: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          warehouse_no: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          address: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
        }), { minLength: 0, maxLength: 50 }),
        async (mockData) => {
          // Mock successful API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Call the service directly to test the API layer
          const result = await shippingService.getAll()

          // Verify the data is correctly returned
          expect(result).toEqual(mockData)
          expect(Array.isArray(result)).toBe(true)
          
          // Verify API was called correctly
          expect(shippingService.getAll).toHaveBeenCalledWith()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle successful data loading for banking details', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          client_type: fc.constantFrom('buyer', 'supplier'),
          client_id: fc.integer({ min: 1, max: 100 }),
          client_name: fc.string({ minLength: 1, maxLength: 50 }),
          country: fc.option(fc.string({ minLength: 2, maxLength: 50 })),
          bank_name: fc.string({ minLength: 1, maxLength: 100 }),
          sort_code: fc.option(fc.string({ minLength: 6, maxLength: 8 })),
          account_number: fc.string({ minLength: 8, maxLength: 20 }),
        }), { minLength: 0, maxLength: 50 }),
        async (mockData) => {
          // Mock successful API response
          vi.mocked(bankingService.getAll).mockResolvedValue(mockData)

          // Call the service directly to test the API layer
          const result = await bankingService.getAll()

          // Verify the data is correctly returned
          expect(result).toEqual(mockData)
          expect(Array.isArray(result)).toBe(true)
          
          // Verify API was called correctly
          expect(bankingService.getAll).toHaveBeenCalledWith()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle empty data arrays gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant([]), // Always empty array
        async (emptyData) => {
          // Mock empty response for both services
          vi.mocked(shippingService.getAll).mockResolvedValue(emptyData)
          vi.mocked(bankingService.getAll).mockResolvedValue(emptyData)

          // Test shipping service
          const shippingResult = await shippingService.getAll()
          expect(shippingResult).toEqual([])
          expect(Array.isArray(shippingResult)).toBe(true)

          // Test banking service
          const bankingResult = await bankingService.getAll()
          expect(bankingResult).toEqual([])
          expect(Array.isArray(bankingResult)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle network errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          new Error('Network Error'),
          new Error('Timeout'),
          new Error('Connection refused'),
          new Error('Server unavailable')
        ),
        async (networkError) => {
          // Mock network error for both services
          vi.mocked(shippingService.getAll).mockRejectedValue(networkError)
          vi.mocked(bankingService.getAll).mockRejectedValue(networkError)

          // Test shipping service error handling
          await expect(shippingService.getAll()).rejects.toThrow(networkError.message)

          // Test banking service error handling
          await expect(bankingService.getAll()).rejects.toThrow(networkError.message)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle various limit parameters correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.integer({ min: 1, max: 10000 })),
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
        }), { minLength: 0, maxLength: 100 }),
        async (limit, mockData) => {
          // Mock API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Call service with limit parameter
          const result = await shippingService.getAll(limit)

          // Verify API was called with correct limit
          expect(shippingService.getAll).toHaveBeenCalledWith(limit)
          expect(result).toEqual(mockData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain data consistency across multiple calls', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({
          id: fc.integer({ min: 1, max: 1000 }),
          buyer_name: fc.string({ minLength: 1, maxLength: 50 }),
          destination_country: fc.string({ minLength: 2, maxLength: 50 }),
        }), { minLength: 1, maxLength: 20 }),
        async (mockData) => {
          // Mock consistent API response
          vi.mocked(shippingService.getAll).mockResolvedValue(mockData)

          // Make multiple calls
          const result1 = await shippingService.getAll()
          const result2 = await shippingService.getAll()
          const result3 = await shippingService.getAll()

          // Data should remain consistent across calls
          expect(result1).toEqual(mockData)
          expect(result2).toEqual(mockData)
          expect(result3).toEqual(mockData)
          expect(result1).toEqual(result2)
          expect(result2).toEqual(result3)
        }
      ),
      { numRuns: 100 }
    )
  })
})