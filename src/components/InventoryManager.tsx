import React, { useState } from 'react';
import { Ingredient } from '../types';
import { 
  Boxes, 
  Plus, 
  AlertTriangle, 
  HelpCircle, 
  RefreshCw, 
  TrendingDown, 
  CheckCircle, 
  PackageCheck,
  PlusCircle
} from 'lucide-react';

interface InventoryManagerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onUpdateStock: (ingredientId: string, newStock: number) => void;
}

export default function InventoryManager({
  ingredients,
  onAddIngredient,
  onUpdateStock
}: InventoryManagerProps) {
  // New ingredient state variables
  const [newIngName, setNewIngName] = useState<string>('');
  const [newIngStock, setNewIngStock] = useState<string>('');
  const [newIngMin, setNewIngMin] = useState<string>('');
  const [newIngUnit, setNewIngUnit] = useState<string>('pz');

  // Filter for search
  const [ingSearchQuery, setIngSearchQuery] = useState<string>('');

  // Critical alerts count (ingredients below minStock)
  const criticalIngredients = ingredients.filter(i => i.stock <= i.minStock);

  const handleAddNewIng = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) {
      alert('Ingresa el nombre del ingrediente.');
      return;
    }
    const stockVal = parseFloat(newIngStock) || 0;
    const minVal = parseFloat(newIngMin) || 0;

    onAddIngredient({
      name: newIngName,
      stock: stockVal,
      minStock: minVal,
      unit: newIngUnit
    });

    // Reset inputs
    setNewIngName('');
    setNewIngStock('');
    setNewIngMin('');
    setNewIngUnit('pz');
    alert(`Ingrediente "${newIngName}" registrado en base de datos.`);
  };

  const filteredIng = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(ingSearchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex bg-slate-50 overflow-hidden">
      {/* Left major partition layout column: Stock list tables & overview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Header toolbar stats */}
        <div className="p-6 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Inventario de Almacén</h2>
              <p className="text-xs text-slate-500">Supervisa e incrementa materia prima. El sistema descuenta stock automáticamente al salir comandas de cocina.</p>
            </div>
            
            {/* Realtime alerts widget banner */}
            {criticalIngredients.length > 0 ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-850 rounded-xl text-xs font-semibold animate-pulse">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Abasto Crítico: {criticalIngredients.length} ingredientes requieren restock.</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                <PackageCheck className="h-4 w-4 text-emerald-600" />
                <span>Abasto Óptimo: Todos los insumos con cantidades suficientes.</span>
              </div>
            )}
          </div>
        </div>

        {/* Searching bar tool */}
        <div className="px-6 py-4 border-b border-slate-200 flex gap-4 bg-slate-50/60 shrink-0">
          <input
            id="ingredient-search"
            type="text"
            placeholder="Filtrar por nombre de ingrediente..."
            value={ingSearchQuery}
            onChange={(e) => setIngSearchQuery(e.target.value)}
            className="flex-1 text-xs font-sans bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
          />
        </div>

        {/* Stock items Grid display */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIng.map((ing) => {
              const isLow = ing.stock <= ing.minStock;
              const fillPct = Math.min(100, Math.max(0, (ing.stock / (ing.minStock * 2.5)) * 100));

              return (
                <div 
                  key={ing.id} 
                  id={`ing-item-${ing.id}`}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-xs flex flex-col justify-between ${
                    isLow 
                      ? 'bg-rose-50/50 border-rose-200 text-rose-900' 
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-sans">{ing.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Mínimo establecido: <strong className="text-slate-700">{ing.minStock} {ing.unit}</strong>
                      </p>
                    </div>

                    {isLow ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
                        Reabastecer
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider">
                        Normal
                      </span>
                    )}
                  </div>

                  {/* Stock values & quick increment buttons */}
                  <div className="flex items-center justify-between mt-4 gap-6 bg-slate-50 p-2.5 rounded-xl border border-slate-200/50">
                    <div className="font-mono">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wide">Stock Disponible</span>
                      <strong className="text-xl font-bold text-slate-900">
                        {ing.stock.toFixed(2)} <span className="text-xs font-medium text-slate-500">{ing.unit}</span>
                      </strong>
                    </div>

                    {/* Quick increment buttons action row */}
                    <div className="flex gap-1">
                      <button
                        id={`add-5-${ing.id}`}
                        onClick={() => onUpdateStock(ing.id, ing.stock + 5)}
                        className="px-2.5 py-1.5 text-[10px] font-bold font-mono bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-lg text-slate-700 transition-all cursor-pointer"
                      >
                        +5
                      </button>
                      <button
                        id={`add-20-${ing.id}`}
                        onClick={() => onUpdateStock(ing.id, ing.stock + 20)}
                        className="px-2.5 py-1.5 text-[10px] font-bold font-mono bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-350 rounded-lg text-slate-700 transition-all cursor-pointer"
                      >
                        +20
                      </button>
                      <button
                        id={`add-100-${ing.id}`}
                        onClick={() => onUpdateStock(ing.id, ing.stock + 100)}
                        className="px-2.5 py-1.5 text-[10px] font-bold font-mono bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-700 transition-all cursor-pointer"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form column: Register new ingredients */}
      <div className="w-96 border-l border-slate-200 bg-white shadow-xl flex flex-col shrink-0 p-6 overflow-y-auto">
        <div className="border-b border-slate-100 pb-5 mb-5 shrink-0">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Catalogación</span>
          <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5 text-emerald-500" />
            <span>Registrar Nuevo Insumo</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Registra nuevos artículos para ser consumidos e incluidos en recetas.</p>
        </div>

        {/* Input specifications form details */}
        <form onSubmit={handleAddNewIng} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Nombre del Ingrediente *</label>
            <input
              id="new-ing-name"
              type="text"
              placeholder="Ej. Salsa Habanera picante"
              value={newIngName}
              onChange={(e) => setNewIngName(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Stock Inicial *</label>
              <input
                id="new-ing-stock"
                type="number"
                step="any"
                placeholder="Ej. 15.0"
                value={newIngStock}
                onChange={(e) => setNewIngStock(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Unidad Medida *</label>
              <select
                id="new-ing-unit"
                value={newIngUnit}
                onChange={(e) => setNewIngUnit(e.target.value)}
                className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 cursor-pointer"
              >
                <option value="pz">pz (Pieza)</option>
                <option value="kg">kg (Kilos)</option>
                <option value="g">g (Gramos)</option>
                <option value="L">L (Litros)</option>
                <option value="botella">botella</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Stock Mínimo Alerta *</label>
            <input
              id="new-ing-min"
              type="number"
              step="any"
              placeholder="Ej. 3.0"
              value={newIngMin}
              onChange={(e) => setNewIngMin(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
            />
            <span className="text-[10px] text-slate-400 font-mono mt-1.5 block">Cuando el stock baje de este valor, se alertará.</span>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase rounded-xl transition-all shadow-md cursor-pointer"
          >
            Añadir al Almacén
          </button>
        </form>
      </div>
    </div>
  );
}
