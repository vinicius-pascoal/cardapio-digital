import CategoriaComponet from "./CategoriaComponet";

export default function CategoriasList() {
  const categorias = [
    {
      ativo: true,
      nome: "Entradas",
      itens: [
        { nome: "Salada Caesar", preco: "R$ 25,00" },
        { nome: "Bruschetta", preco: "R$ 15,00" },
        { nome: "Batata Frita", preco: "R$ 10,00" },
      ],
    },
    {
      ativo: true,
      nome: "Prato Principal",
      itens: [
        { nome: "Bife à Parmegiana", preco: "R$ 35,00" },
        { nome: "Frango Grelhado", preco: "R$ 30,00" },
      ],
    },
    {
      ativo: false,
      nome: "Sobremesas",
      itens: [
        { nome: "Torta de Limão", preco: "R$ 12,00" },
        { nome: "Pudim", preco: "R$ 8,00" },
      ],
    },
    {
      ativo: false,
      nome: "Bebidas",
      itens: [
        { nome: "Refrigerante", preco: "R$ 5,00" },
        { nome: "Suco Natural", preco: "R$ 7,00" },
        { nome: "Cerveja Artesanal", preco: "R$ 12,00" },
      ],
    },
  ];

  return (
    <div className="w-full">
      {categorias.map((categoria, index) => (
        <div
          className="w-full flex flex-col items-center align-middle"
          key={index}
        >
          <CategoriaComponet
            ativo={categoria.ativo}
            key={index}
            nomeCategoria={categoria.nome}
            itens={categoria.itens}
          />
          <div className="w-4/5 mb-8 border-gray-800 border-b-4 border-solid" />
        </div>
      ))}
    </div>
  );
}
