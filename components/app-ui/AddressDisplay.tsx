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

export type Address = {
  id: string;
  type: string;
  street: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
};

export default function AddressDisplay({ addresses: initialAddresses }: { addresses: Address[] }) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const resetForm = () => {
    setCurrentAddress({
      id: "",
      type: "Home",
      street: "",
      city: "",
      state: "",
      country: "",
      isDefault: false,
    });
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentAddress(prev => ({ ...prev!, [name]: value }));
  };

  const handleSetDefault = (checked: boolean) => {
    if (checked) {
      // If setting to default, first unset any existing default address
      setAddresses(prev =>
        prev.map(addr => ({ ...addr, isDefault: false }))
      );
    }
    setCurrentAddress(prev => ({ ...prev!, isDefault: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddress) return;

    try {
      if (isEditing) {
        setAddresses(prev =>
          prev.map(addr =>
            addr.id === currentAddress.id 
              ? currentAddress 
              : currentAddress.isDefault 
                ? { ...addr, isDefault: false } 
                : addr
          )
        );
        toast.success("Address updated successfully");
      } else {
        const newAddress = {
          ...currentAddress,
          id: `addr-${Date.now()}`,
          isDefault: currentAddress.isDefault,
        };
        
        setAddresses(prev => [
          ...prev.map(addr => 
            newAddress.isDefault 
              ? { ...addr, isDefault: false } 
              : addr
          ),
          newAddress
        ]);

        try {
            const res = await fetch(`/api/address`, {
                method: "POST",
                body: JSON.stringify(newAddress)
            })

            if (!res.ok) {
                const errorRes = await res.json();
                toast.error(errorRes.error);
            }
        } catch (error) {
            console.log(error)
            toast.error("something went wrong")
            return;
        }

        toast.success("Address added successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save address");
    }
  };

  const handleDelete = () => {
    if (!currentAddress) return;
    
    try {
      const wasDefault = currentAddress.isDefault;
      setAddresses(prev => prev.filter(addr => addr.id !== currentAddress.id));
      
      if (wasDefault && addresses.length > 1) {
        setAddresses(prev => [
          { ...prev[0], isDefault: true },
          ...prev.slice(1)
        ]);
      }
      
      toast.success("Address removed successfully");
      setIsDeleteDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to remove address");
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
                key={address.id}
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
                        {address.type}
                      </h3>
                      {address.isDefault && (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {address.street}, {address.city}, {address.state},{" "}
                      {address.country}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {address.isDefault && "★ Primary shipping address"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="dark:border-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleEditClick(address)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">
                      Address Type
                    </Label>
                    <Select
                      value={currentAddress?.type || "Home"}
                      onValueChange={(value) =>
                        setCurrentAddress(prev => ({ ...prev!, type: value }))
                      }
                    >
                      <SelectTrigger className="dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectItem value="Home">Home</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">
                      Country
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
                <div className="space-y-2">
                  <Label htmlFor="street" className="text-gray-700 dark:text-gray-300">
                    Street Address
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
                      City
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
                      State/Province
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
                        {addresses.some(a => a.isDefault && a.id !== currentAddress.id) 
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
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-600"
                  >
                    {isEditing ? "Update Address" : "Save Address"}
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
                      {currentAddress.type}
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
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Address
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}