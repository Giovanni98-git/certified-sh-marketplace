import { useState, useEffect } from 'react'
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  usePublicClient 
} from 'wagmi'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { contractAddress } from '../lib/wagmi'
import ABI from '@/lib/contract_abi'



interface Item {
  tokenId: bigint
  name: string
  value: bigint
  description: string
  serialNumber: string
  owner: string
  imageURI: string
  isForSale: boolean
  salePrice: bigint
  isCertified: boolean
  certifiedBy: string
}

// Type pour la réponse du contrat
type ContractItemResponse = [
  bigint, 
  string, 
  bigint, 
  string, 
  string, 
  string, 
  string, 
  boolean, 
  bigint, 
  boolean, 
  string
]

export default function ItemsList({ showOnlyUserItems = false }) {
  const { address } = useAccount()
  const [items, setItems] = useState<Item[]>([])
  const [salePrices, setSalePrices] = useState<{[key: string]: string}>({})
  const { writeContract, isPending, data: hash } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash })
  const publicClient = usePublicClient()

  // // pour 
  

  // const { data: availableItems, refetch: refetchAvailableItems } = useReadContract({
  //   address: contractAddress,
  //   abi: ABI,
  //   functionName: 'getAvailableItems',
  // })


    // pour 
    let  userQuery = {
    address: contractAddress,
    abi: ABI,
    functionName: 'getUserItems',
    args: [address],
  }


    let availableQuery = {
    address: contractAddress,
    abi: ABI,
    functionName: 'getAvailableItems',

  }

  let  query =  showOnlyUserItems ? userQuery: availableQuery;

  const { data: availableItems, refetch: refetchAvailableItems } = useReadContract(query as any)

  console.log("available items",availableItems)

  // Fonction pour convertir la réponse du contrat en objet Item
  const mapContractResponseToItem = (response: ContractItemResponse, tokenId: bigint): Item => {
    return {
      tokenId: response[0] || tokenId,
      name: response[1],
      value: response[2],
      description: response[3],
      serialNumber: response[4],
      owner: response[5],
      imageURI: response[6],
      isForSale: response[7],
      salePrice: response[8],
      isCertified: response[9],
      certifiedBy: response[10]
    }
  }

  useEffect(() => {
    const fetchItems = async () => {
      // Vérifier que availableItems est un tableau et non vide
      if (publicClient && Array.isArray(availableItems) && availableItems.length > 0) {
        const itemsData: Item[] = []
        
        for (const tokenId of availableItems) {
          try {
            const response = await publicClient.readContract({
              address: contractAddress,
              abi: ABI,
              functionName: 'items',
              args: [tokenId],
            }) as unknown as ContractItemResponse
            
            const item = mapContractResponseToItem(response, tokenId)
            itemsData.push(item)
          } catch (error) {
            console.error(`Error fetching item ${tokenId}:`, error)
          }
        }
        setItems(itemsData)
      } else if (availableItems === null || availableItems === undefined) {
        // Si availableItems est null ou undefined, réinitialiser la liste
        setItems([])
      }
    }

    fetchItems()
  }, [availableItems, publicClient])

  const handleListForSale = (tokenId: bigint, salePrice: string) => {
    if (!salePrice || isNaN(parseFloat(salePrice))) {
      toast.error('Veuillez entrer un prix valide')
      return
    }

    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'listItemForSale',
      args: [tokenId, BigInt(parseFloat(salePrice) * 1e18)],
    })
  }

  const handlePurchase = (tokenId: bigint, salePrice: bigint) => {
    writeContract({
      address: contractAddress,
      abi: ABI,
      functionName: 'purchaseItem',
      args: [tokenId],
      value: salePrice,
    })
  }

  useEffect(() => {
    if (isConfirmed) {
      refetchAvailableItems()
      toast.success('Votre transaction a été confirmée avec succès')
    }
  }, [isConfirmed, refetchAvailableItems])

  const filteredItems = showOnlyUserItems
    ? items.filter(item => item.owner.toLowerCase() === address?.toLowerCase())
    : items

  if (!availableItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des articles...</span>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {filteredItems.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">
            {showOnlyUserItems 
              ? "Vous n'avez aucun article enregistré." 
              : "Aucun article disponible à l'achat pour le moment."}
          </p>
        </div>
      ) : (
        filteredItems.map((item) => (
          <Card key={item.tokenId.toString()} className="overflow-hidden">
            <img
              src={item.imageURI+"/téléchargement.jpg" || "https://via.placeholder.com/300"}
              alt={item.name}
              className="w-full h-48 object-cover"
            />
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.isCertified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Certifié
                  </Badge>
                )}
              </div>
              <CardDescription>{item.description.slice(0, 100)}...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">Valeur: {Number(item.value) / 1e18} ETH</p>
                <p className="text-sm">Série: {item.serialNumber}</p>
                <p className="text-sm">Propriétaire: {item.owner.slice(0, 6)}...{item.owner.slice(-4)}</p>
                
                {item.isForSale ? (
                  <>
                    <p className="font-semibold text-primary">
                      Prix: {Number(item.salePrice) / 1e18} ETH
                    </p>
                    {item.owner.toLowerCase() !== address?.toLowerCase() && (
                      <Button 
                        size="sm" 
                        onClick={() => handlePurchase(item.tokenId, item.salePrice)}
                        disabled={isPending || isConfirming}
                      >
                        {isPending || isConfirming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Acheter'
                        )}
                      </Button>
                    )}
                  </>
                ) : item.owner.toLowerCase() === address?.toLowerCase() ? (
                  <div className="space-y-2">
                    <Input
                      placeholder="Prix de vente (ETH)"
                      value={salePrices[item.tokenId.toString()] || ''}
                      onChange={(e) => setSalePrices({
                        ...salePrices,
                        [item.tokenId.toString()]: e.target.value
                      })}
                      type="number"
                      step="0.01"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleListForSale(item.tokenId, salePrices[item.tokenId.toString()])}
                      disabled={isPending || isConfirming}
                    >
                      {isPending || isConfirming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Mettre en vente'
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Non disponible à la vente</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}