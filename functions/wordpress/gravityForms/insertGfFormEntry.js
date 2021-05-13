import {initializeWpApollo} from '@/lib/wordpress/connector'
import mutationInsertFormEntry from '@/lib/wordpress/gravityForms/mutationInsertFormEntry'

/**
 * Submit GF form entry via WP GraphQL.
 *
 * @author WebDevStudios
 * @param  {number}      formId      GF form ID.
 * @param  {object}      fieldValues GF form field values.
 * @return {fieldValues}             Entry ID or error object.
 */
export default async function insertGfFormEntry(formId, fieldValues) {
  // Get/create Apollo instance.
  const apolloClient = initializeWpApollo()

  // Set up return object.
  const response = {
    apolloClient,
    entryId: null
  }

  // Determine query variables.
  const variables = {
    formId,
    fieldValues
  }

  // Execute query.
  await apolloClient
    .mutate({
      mutation: mutationInsertFormEntry,
      variables
    })
    .then((entryData) => {
      const {entryId, entry} = entryData?.data?.submitGravityFormsForm

      // Set error props if data not found.
      if (!entryId) {
        response.error = true
        response.errorMessage =
          'An error occurred while submitting the form entry.'

        return null
      }

      response.entryId = entryId
      response.confirmationMessage =
        entry?.form?.node?.confirmations?.[0]?.message ||
        'Thanks for contacting us! We will get in touch with you shortly.'
    })
    .catch((error) => {
      response.error = true
      response.errorMessage = error.message
    })

  return response
}
