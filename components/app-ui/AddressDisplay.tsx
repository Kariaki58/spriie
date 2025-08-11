"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export type Address = {
  _id: undefined;
  fullName: string;
  type: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export default function AddressDisplay({ 
  addresses: initialAddresses,
  onUpdate,
  isLoading
}: { 
  addresses: Address[];
  onUpdate: (addresses: Address[]) => void;
  isLoading: boolean;
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setCurrentAddress({
      _id: undefined, // Remove empty string _id
      fullName: "",
      type: "home",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      isDefault: addresses.length === 0,
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAddress(prev => ({ ...prev!, [name]: value }));
  };

  const handleSetDefault = (checked: boolean) => {
    setCurrentAddress(prev => ({ ...prev!, isDefault: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddress) return;

    const addressToSubmit = {
      ...currentAddress,
      _id: currentAddress._id || undefined
    };

    // Validate required fields
    const requiredFields = ['fullName', 'type', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
    const missingFields = requiredFields.filter(field => !currentAddress[field as keyof Address]);
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const method = isEditing ? "PUT" : "POST";
      const url = `/api/user/address${isEditing ? `?addressId=${currentAddress._id}` : ''}`;
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressToSubmit),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save address');
      }

      const { addresses: updatedAddresses } = await response.json();
      onUpdate(updatedAddresses);
      toast.success(`Address ${isEditing ? 'updated' : 'added'} successfully`);
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving address:", error);
      toast.error(error.message || `Failed to ${isEditing ? 'update' : 'add'} address`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAddress) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/user/address?addressId=${currentAddress._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete address');
      }

      const { addresses: updatedAddresses } = await response.json();
      onUpdate(updatedAddresses);
      toast.success("Address removed successfully");
      setIsDeleteDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error deleting address:", error);
      toast.error(error.message || "Failed to remove address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (address: Address) => {
    setCurrentAddress(address);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleRemoveClick = (address: Address) => {
    setCurrentAddress(address);
    setIsDeleteDialogOpen(true);
  };

  const handleAddClick = () => {
    resetForm();
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <TabsContent value="addresses">
      <Card className="border-0 shadow-sm dark:bg-gray-800 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100">
            Saved Addresses
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Manage your shipping addresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address._id}
                className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  address.isDefault
                    ? "border-emerald-500 dark:border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {address.fullName} ({address.type})
                      </h3>
                      {address.isDefault && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {address.street}, {address.city}, {address.state}, {address.country}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Postal Code: {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Phone: {address.phone}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleEditClick(address)}
                      disabled={isLoading}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleRemoveClick(address)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {addresses.length === 0 && (
              <div className="border border-dashed rounded-lg p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  You don't have any saved addresses yet.
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-start border-t px-6 py-4 dark:border-gray-700">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:border-emerald-600 dark:text-emerald-400 dark:border-emerald-400 dark:hover:text-emerald-300 dark:hover:border-emerald-300"
                onClick={handleAddClick}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">
                  {isEditing ? "Edit Address" : "Add New Address"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">
                    Full Name*
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={currentAddress?.fullName || ""}
                    onChange={handleInputChange}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
                      Address Type*
                    </Label>
                    <Select
                      value={currentAddress?.type || "home"}
                      onValueChange={(value) =>
                        setCurrentAddress(prev => ({ ...prev!, type: value }))
                      }
                      required
                    >
                      <SelectTrigger className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                      Phone Number*
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={currentAddress?.phone || ""}
                      onChange={handleInputChange}
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street" className="text-gray-700 dark:text-gray-300">
                    Street Address*
                  </Label>
                  <Input
                    id="street"
                    name="street"
                    value={currentAddress?.street || ""}
                    onChange={handleInputChange}
                    className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                      City*
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={currentAddress?.city || ""}
                      onChange={handleInputChange}
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">
                      State/Province*
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={currentAddress?.state || ""}
                      onChange={handleInputChange}
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-gray-700 dark:text-gray-300">
                      Postal Code*
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={currentAddress?.postalCode || ""}
                      onChange={handleInputChange}
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">
                      Country*
                    </Label>
                    <Input
                      id="country"
                      name="country"
                      value={currentAddress?.country || ""}
                      onChange={handleInputChange}
                      className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isDefault"
                    checked={currentAddress?.isDefault || false}
                    onCheckedChange={handleSetDefault}
                    disabled={currentAddress?.isDefault && addresses.some(a => a.isDefault)}
                  />
                  <Label htmlFor="isDefault" className="text-gray-700 dark:text-gray-300">
                    Set as default address
                    {currentAddress?.isDefault && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">
                        {addresses.some(a => a.isDefault && a._id !== currentAddress._id) 
                          ? "This will replace your current default address"
                          : "This is your default shipping address"}
                      </span>
                    )}
                  </Label>
                </div>

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="dark:border-gray-600 dark:text-gray-200"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditing ? "Updating..." : "Saving..."}
                      </>
                    ) : isEditing ? "Update Address" : "Save Address"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">
                  Confirm Removal
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to remove this address?
                </p>
                {currentAddress && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {currentAddress.fullName} ({currentAddress.type})
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {currentAddress.street}, {currentAddress.city}, {currentAddress.state}
                    </p>
                    {currentAddress.isDefault && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Note: This is your default address. Removing it will set another address as default.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    className="dark:border-gray-600 dark:text-gray-200"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove Address
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}