import CategoriaComponet from "./CategoriaComponet";

export default function CategoriasList() {
  const categorias = [
    {
      ativo: true,
      nome: "Entradas",
      itens: [
        {
          nome: "Salada Caesar",
          preco: "R$ 25,00",
          descricao: "Alface, croutons e molho Caesar",
        },
        {
          nome: "Bruschetta",
          preco: "R$ 15,00",
          descricao: "Pão italiano com tomate e manjericão",
        },
        {
          nome: "Batata Frita",
          preco: "R$ 10,00",
          descricao: "Batatas fritas crocantes",
        },
      ],
    },
    {
      ativo: true,
      nome: "Prato Principal",
      itens: [
        {
          nome: "Bife à Parmegiana",
          preco: "R$ 35,00",
          descricao: "Bife empanado com queijo e molho de tomate",
        },
        {
          nome: "Frango Grelhado",
          preco: "R$ 30,00",
          descricao: "Frango grelhado com ervas finas",
        },
      ],
    },
    {
      ativo: false,
      nome: "Sobremesas",
      itens: [
        {
          nome: "Torta de Limão",
          preco: "R$ 12,00",
          descricao: "Torta de limão com merengue",
        },
        {
          nome: "Pudim",
          preco: "R$ 8,00",
          descricao: "Pudim de leite condensado",
        },
      ],
    },
    {
      ativo: false,
      nome: "Bebidas",
      itens: [
        {
          nome: "Refrigerante",
          preco: "R$ 5,00",
          descricao: "Refrigerante de cola",
        },
        {
          nome: "Suco Natural",
          preco: "R$ 7,00",
          descricao: "Suco de laranja natural",
        },
        {
          nome: "Cerveja Artesanal",
          preco: "R$ 12,00",
          descricao: "Cerveja artesanal local",
        },
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
