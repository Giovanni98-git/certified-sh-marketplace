import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contractAddress } from '../lib/wagmi'
import ABI from '@/lib/contract_abi'



export default function RegisterItem() {
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: '',
    serialNumber: '',
    imageURI: ''
  })

  const { writeContract, isPending, data: hash, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'registerItem',
      args: [
        formData.name,
        BigInt(formData.value) * BigInt(1e18), // Convertir en wei
        formData.description,
        formData.serialNumber,
        formData.imageURI || "https://via.placeholder.com/300",
      ],
    })
  }

  if (error) {
    toast('Erreur',{
      description: error.message,
    })
  }

  if (isConfirmed) {
    toast('Item enregistré',{
      description: 'Votre item a été enregistré avec succès',
    })
    setFormData({
      name: '',
      value: '',
      description: '',
      serialNumber: '',
      imageURI: ''
    })
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Enregistrer un Nouvel Item</CardTitle>
        <CardDescription>
          Ajoutez un nouveau bien d'occasion à la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nom du produit"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Valeur estimée (ETH)"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            required
          />
          <Textarea
            placeholder="Description détaillée"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <Input
            placeholder="Numéro de série"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            required
          />
          <Input
            placeholder="URL de l'image (IPFS, etc.)"
            value={formData.imageURI}
            onChange={(e) => setFormData({ ...formData, imageURI: e.target.value })}
          />
          <Button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full"
          >
            {isPending || isConfirming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer l\'item'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}