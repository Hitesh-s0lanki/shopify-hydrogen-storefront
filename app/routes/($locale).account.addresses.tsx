import type {CustomerAddressInput} from '@shopify/hydrogen/customer-account-api-types';
import type {
  AddressFragment,
  CustomerFragment,
} from 'customer-accountapi.generated';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
  type Fetcher,
} from 'react-router';
import type {Route} from './+types/account.addresses';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Label} from '~/components/ui/label';
import {Checkbox} from '~/components/ui/checkbox';
import {Alert, AlertDescription} from '~/components/ui/alert';
import {Badge} from '~/components/ui/badge';
import {
  AlertCircle,
  MapPin,
  Trash2,
  Save,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

export type ActionResponse = {
  addressId?: string | null;
  createdAddress?: AddressFragment;
  defaultAddress?: string | null;
  deletedAddress?: string | null;
  error: Record<AddressFragment['id'], string> | null;
  updatedAddress?: AddressFragment;
};

export const meta: Route.MetaFunction = () => {
  return [{title: 'Addresses'}];
};

export async function loader({context}: Route.LoaderArgs) {
  context.customerAccount.handleAuthStatus();

  return {};
}

export async function action({request, context}: Route.ActionArgs) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address: CustomerAddressInput = {};
    const keys: (keyof CustomerAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error: unknown) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext<{customer: CustomerFragment}>();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Addresses</h1>
        <p className="text-muted-foreground mt-2">
          Manage your shipping addresses
        </p>
      </div>

      {!addresses.nodes.length ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MapPin className="size-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No addresses saved
              </h3>
              <p className="text-muted-foreground mb-6">
                You have no addresses saved. Add your first address below.
              </p>
              <NewAddressForm />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Add New Address
              </CardTitle>
              <CardDescription>
                Create a new shipping address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NewAddressForm />
            </CardContent>
          </Card>

          <hr className="my-6 border-border" />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Existing Addresses</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.nodes.map((address) => (
                <AddressCard
                  key={address.id}
                  addressId={address.id}
                  address={address}
                  defaultAddress={defaultAddress}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  } as CustomerAddressInput;

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <Button
          disabled={stateForMethod('POST') !== 'idle'}
          formMethod="POST"
          type="submit"
          className="w-full"
        >
          {stateForMethod('POST') !== 'idle' ? (
            <>Creating...</>
          ) : (
            <>
              <Plus className="size-4 mr-2" />
              Create Address
            </>
          )}
        </Button>
      )}
    </AddressForm>
  );
}

function AddressCard({
  addressId,
  address,
  defaultAddress,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
}) {
  const isDefaultAddress = defaultAddress?.id === addressId;
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            {address.firstName} {address.lastName}
          </CardTitle>
          {isDefaultAddress && (
            <Badge variant="default">Default</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <AddressForm
          addressId={addressId}
          address={address}
          defaultAddress={defaultAddress}
        >
          {({stateForMethod}) => (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="flex gap-2">
                <Button
                  disabled={stateForMethod('PUT') !== 'idle'}
                  formMethod="PUT"
                  type="submit"
                  className="flex-1"
                >
                  {stateForMethod('PUT') !== 'idle' ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={stateForMethod('DELETE') !== 'idle'}
                      type="button"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Address</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this address? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Form method="DELETE" className="inline">
                        <input type="hidden" name="addressId" value={addressId} />
                        <AlertDialogAction asChild>
                          <Button
                            type="submit"
                            variant="destructive"
                            disabled={stateForMethod('DELETE') !== 'idle'}
                          >
                            {stateForMethod('DELETE') !== 'idle' ? 'Deleting...' : 'Delete'}
                          </Button>
                        </AlertDialogAction>
                      </Form>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </AddressForm>
      </CardContent>
    </Card>
  );
}

export function AddressForm({
  addressId,
  address,
  defaultAddress,
  children,
}: {
  addressId: AddressFragment['id'];
  address: CustomerAddressInput;
  defaultAddress: CustomerFragment['defaultAddress'];
  children: (props: {
    stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
  }) => React.ReactNode;
}) {
  const {state, formMethod} = useNavigation();
  const action = useActionData<ActionResponse>();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId} className="space-y-4">
      <input type="hidden" name="addressId" defaultValue={addressId} />
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`firstName-${addressId}`}>First name*</Label>
          <Input
            aria-label="First name"
            autoComplete="given-name"
            defaultValue={address?.firstName ?? ''}
            id={`firstName-${addressId}`}
            name="firstName"
            placeholder="First name"
            required
            type="text"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`lastName-${addressId}`}>Last name*</Label>
          <Input
            aria-label="Last name"
            autoComplete="family-name"
            defaultValue={address?.lastName ?? ''}
            id={`lastName-${addressId}`}
            name="lastName"
            placeholder="Last name"
            required
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`company-${addressId}`}>Company</Label>
        <Input
          aria-label="Company"
          autoComplete="organization"
          defaultValue={address?.company ?? ''}
          id={`company-${addressId}`}
          name="company"
          placeholder="Company"
          type="text"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`address1-${addressId}`}>Address line 1*</Label>
        <Input
          aria-label="Address line 1"
          autoComplete="address-line1"
          defaultValue={address?.address1 ?? ''}
          id={`address1-${addressId}`}
          name="address1"
          placeholder="Address line 1"
          required
          type="text"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`address2-${addressId}`}>Address line 2</Label>
        <Input
          aria-label="Address line 2"
          autoComplete="address-line2"
          defaultValue={address?.address2 ?? ''}
          id={`address2-${addressId}`}
          name="address2"
          placeholder="Address line 2"
          type="text"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`city-${addressId}`}>City*</Label>
          <Input
            aria-label="City"
            autoComplete="address-level2"
            defaultValue={address?.city ?? ''}
            id={`city-${addressId}`}
            name="city"
            placeholder="City"
            required
            type="text"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`zoneCode-${addressId}`}>State / Province*</Label>
          <Input
            aria-label="State/Province"
            autoComplete="address-level1"
            defaultValue={address?.zoneCode ?? ''}
            id={`zoneCode-${addressId}`}
            name="zoneCode"
            placeholder="State / Province"
            required
            type="text"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`zip-${addressId}`}>Zip / Postal Code*</Label>
          <Input
            aria-label="Zip"
            autoComplete="postal-code"
            defaultValue={address?.zip ?? ''}
            id={`zip-${addressId}`}
            name="zip"
            placeholder="Zip / Postal Code"
            required
            type="text"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`territoryCode-${addressId}`}>Country Code*</Label>
          <Input
            aria-label="territoryCode"
            autoComplete="country"
            defaultValue={address?.territoryCode ?? ''}
            id={`territoryCode-${addressId}`}
            name="territoryCode"
            placeholder="Country (e.g., US)"
            required
            type="text"
            maxLength={2}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`phoneNumber-${addressId}`}>Phone</Label>
        <Input
          aria-label="Phone Number"
          autoComplete="tel"
          defaultValue={address?.phoneNumber ?? ''}
          id={`phoneNumber-${addressId}`}
          name="phoneNumber"
          placeholder="+16135551111"
          pattern="^\+?[1-9]\d{3,14}$"
          type="tel"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id={`defaultAddress-${addressId}`}
          name="defaultAddress"
          defaultChecked={isDefaultAddress}
        />
        <Label
          htmlFor={`defaultAddress-${addressId}`}
          className="text-sm font-normal cursor-pointer"
        >
          Set as default address
        </Label>
      </div>

      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}

